-- ============================================================================
-- LIFESKL — migration 0002: courses you're enrolled in, lessons you've
-- finished, and the XP/streak engine.
--
-- Run AFTER 0001_init.sql in the Supabase SQL Editor.
--
-- Adds:
--   * lessons.unit            — journey grouping ("Level 1", "Level 2"…)
--   * lessons.summary_points  — "what you learned" bullets for the summary
--   * profiles.active_course_id
--   * course_enrollments      — which courses a user has joined
--   * lesson_completions      — one row per (user, lesson) finished
--   * complete_lesson() RPC   — the ONLY way XP/streaks are written
--
-- After this runs, profiles.xp / streak writes happen exclusively through the
-- security-definer RPC, so the bootstrap-era "update own profile freely"
-- policy is replaced with a column-safe one.
-- ============================================================================

-- ---------------------------------------------------------------- lessons

alter table public.lessons
  add column if not exists unit integer not null default 1,
  add column if not exists summary_points jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------- profiles

alter table public.profiles
  add column if not exists active_course_id uuid references public.courses (id) on delete set null;

-- ------------------------------------------------------------- enrollments

create table if not exists public.course_enrollments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.course_enrollments enable row level security;

create policy "enrollments_select_own"
  on public.course_enrollments for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "enrollments_insert_own"
  on public.course_enrollments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "enrollments_delete_own"
  on public.course_enrollments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------- completions

create table if not exists public.lesson_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  correct_count integer not null default 0 check (correct_count >= 0),
  total_count integer not null default 0 check (total_count >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  primary key (user_id, lesson_id)
);

create index if not exists lesson_completions_user_idx
  on public.lesson_completions (user_id, completed_at desc);

alter table public.lesson_completions enable row level security;

-- Read-only from the client; writes go through complete_lesson().
create policy "completions_select_own"
  on public.lesson_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------- the RPC
-- Awards XP, feeds the streak, and records the completion in one atomic call.
-- Idempotent per lesson: repeating a lesson re-records your score but only
-- pays a small "review" XP, so grinding one lesson can't farm the leaderboard.

create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_correct integer,
  p_total integer
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_xp_reward integer;
  v_already boolean;
  v_xp_awarded integer;
  v_profile public.profiles%rowtype;
  v_today date := (now() at time zone 'utc')::date;
  v_gap integer;
  v_new_streak integer;
begin
  if v_user is null then
    raise exception 'complete_lesson requires an authenticated user';
  end if;

  select xp_reward into v_xp_reward
  from public.lessons
  where id = p_lesson_id and is_published;
  if v_xp_reward is null then
    raise exception 'lesson % not found', p_lesson_id;
  end if;

  select exists (
    select 1 from public.lesson_completions
    where user_id = v_user and lesson_id = p_lesson_id
  ) into v_already;

  v_xp_awarded := case when v_already then 5 else v_xp_reward end;

  insert into public.lesson_completions
    (user_id, lesson_id, correct_count, total_count, xp_earned)
  values
    (v_user, p_lesson_id, greatest(p_correct, 0), greatest(p_total, 0), v_xp_awarded)
  on conflict (user_id, lesson_id) do update set
    completed_at  = now(),
    correct_count = greatest(excluded.correct_count, public.lesson_completions.correct_count),
    total_count   = excluded.total_count,
    xp_earned     = public.lesson_completions.xp_earned + excluded.xp_earned;

  select * into v_profile from public.profiles where id = v_user for update;

  -- Streak math mirrors nextStreakDays() in @lifeskl/core: same day keeps it,
  -- consecutive day grows it, a gap resets to 1.
  if v_profile.last_active_date is null then
    v_new_streak := 1;
  else
    v_gap := v_today - v_profile.last_active_date;
    if v_gap = 0 then
      v_new_streak := greatest(v_profile.streak_days, 1);
    elsif v_gap = 1 then
      v_new_streak := v_profile.streak_days + 1;
    else
      v_new_streak := 1;
    end if;
  end if;

  update public.profiles
  set xp = xp + v_xp_awarded,
      streak_days = v_new_streak,
      last_active_date = v_today
  where id = v_user;

  return jsonb_build_object(
    'xp_awarded', v_xp_awarded,
    'new_xp', v_profile.xp + v_xp_awarded,
    'streak_days', v_new_streak,
    'already_completed', v_already
  );
end;
$$;

revoke all on function public.complete_lesson(uuid, integer, integer) from public;
grant execute on function public.complete_lesson(uuid, integer, integer) to authenticated;

-- -------------------------------------------------- tighten profile updates
-- XP/streak now flow through the RPC only. Users may still edit their own
-- display fields and active course; a trigger guards the protected columns
-- (RLS policies can't restrict columns directly).

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  -- The RPC runs as the function owner (security definer), which bypasses
  -- this check via the role test below; end-user sessions cannot touch
  -- xp/streak/last_active_date.
  if current_setting('role', true) = 'authenticated' and (
    new.xp is distinct from old.xp
    or new.streak_days is distinct from old.streak_days
    or new.last_active_date is distinct from old.last_active_date
  ) then
    raise exception 'xp and streak are updated by complete_lesson() only';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();
