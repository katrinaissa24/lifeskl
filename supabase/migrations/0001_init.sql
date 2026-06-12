-- ============================================================================
-- LIFESKL — initial schema
-- Run this FIRST in the Supabase SQL Editor (Dashboard → SQL Editor → New
-- query → paste → Run). Then run /supabase/seed.sql.
--
-- Creates: profiles, courses, lessons, friendships
-- Plus: row-level security on everything, and a trigger that auto-creates a
-- profile row whenever someone signs up through Supabase Auth.
-- ============================================================================

-- ---------------------------------------------------------------- helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles
-- One row per auth user. Created automatically by the on_auth_user_created
-- trigger below — the app never inserts into this table directly.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Any signed-in user can view profiles (needed for friend search and
-- Duolingo-style public profiles). Only you can edit your own.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- NOTE: this lets a user update their own xp/streak directly. Fine while we
-- bootstrap; when lesson-progress tracking lands, XP writes move into a
-- security-definer RPC and this policy gets tightened.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Auto-create a profile on signup. Username comes from the signup form
-- (raw_user_meta_data.username), falling back to the email's local part,
-- with a random suffix if taken.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  base text;
  candidate text;
begin
  base := lower(regexp_replace(
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'
  ));
  if length(base) < 3 then
    base := 'learner';
  end if;
  base := left(base, 18);

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base || '_' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), candidate)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------- courses

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  emoji text not null default '✦',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

alter table public.courses enable row level security;

-- Catalog is public (anon included) so marketing pages can read it.
-- No insert/update/delete policies: content is managed from the Supabase
-- dashboard / service role for now.
create policy "courses_select_published"
  on public.courses for select
  to anon, authenticated
  using (is_published);

-- ----------------------------------------------------------------- lessons
-- content is a JSONB array of blocks; see LessonBlock in packages/core:
--   { "type": "material",        "title": "...", "body": "..." }
--   { "type": "multiple_choice", "prompt": "...", "options": [...],
--     "correctIndex": 1, "explanation": "..." }
--   { "type": "true_false",      "prompt": "...", "answer": true,
--     "explanation": "..." }
-- New delivery formats = new block types. No schema change needed.

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  xp_reward integer not null default 10 check (xp_reward >= 0),
  sort_order integer not null default 0,
  content jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create index lessons_course_idx on public.lessons (course_id, sort_order);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

alter table public.lessons enable row level security;

create policy "lessons_select_published"
  on public.lessons for select
  to anon, authenticated
  using (is_published);

-- ------------------------------------------------------------- friendships
-- A friend request is one row: requester → addressee, status 'pending'.
-- Accepting flips status to 'accepted' (one row per friendship, not two).

create table public.friendships (
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index friendships_addressee_idx on public.friendships (addressee_id, status);

alter table public.friendships enable row level security;

-- You can only see friendships you're part of.
create policy "friendships_select_own"
  on public.friendships for select
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

-- You can only send requests as yourself.
create policy "friendships_insert_as_requester"
  on public.friendships for insert
  to authenticated
  with check ((select auth.uid()) = requester_id);

-- Only the person who received the request can respond to it.
create policy "friendships_update_as_addressee"
  on public.friendships for update
  to authenticated
  using ((select auth.uid()) = addressee_id)
  with check ((select auth.uid()) = addressee_id);

-- Either side can unfriend / cancel a pending request.
create policy "friendships_delete_own"
  on public.friendships for delete
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));
