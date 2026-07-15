-- ============================================================================
-- LIFESKL — migration 0005: lock down real users' data from anonymous guests.
--
-- Run AFTER 0004_anonymous_signin.sql in the Supabase SQL Editor.
--
-- Anonymous (guest) sessions assume the SAME `authenticated` role as permanent
-- users, so every existing "to authenticated" policy silently started applying
-- to guests the moment anonymous sign-ins were enabled. This migration draws
-- the line back: a guest can read and write ONLY their own data, and cannot
-- see, touch, or friend anyone with a real account.
--
-- How we tell them apart: the JWT carries an `is_anonymous` claim
-- (auth.jwt() ->> 'is_anonymous'). The expression
--     (auth.jwt() ->> 'is_anonymous')::boolean is not true
-- reads as "caller is NOT anonymous" and is null-safe — a permanent user whose
-- token somehow lacks the claim still passes, only an explicit `true` is blocked.
--
-- Two enforcement surfaces, because RLS alone isn't enough:
--   1. RESTRICTIVE RLS policies (AND-combined with the existing permissive ones)
--      on the tables guests reach directly.
--   2. In-body guards on the SECURITY DEFINER functions, which run as the owner
--      and BYPASS RLS — so the table policies below would never fire for them.
-- ============================================================================

-- ---------------------------------------------------------------- friendships
-- The whole friend graph is permanent-users-only. A restrictive FOR ALL policy
-- ANDs with every existing friendships policy, so guests can't select, insert,
-- accept, or delete a single friendship row regardless of the other rules.

drop policy if exists "friendships_no_anonymous" on public.friendships;
create policy "friendships_no_anonymous"
  on public.friendships
  as restrictive
  for all
  to authenticated
  using ((select (auth.jwt() ->> 'is_anonymous')::boolean) is not true)
  with check ((select (auth.jwt() ->> 'is_anonymous')::boolean) is not true);

-- ------------------------------------------------------------------- profiles
-- Permanent users still see every profile (needed for friend search and public
-- profile pages). A guest may see ONLY their own row, so they can't enumerate
-- the real-user directory. This restrictive policy covers SELECT only; the
-- existing profiles_update_own still lets a guest edit their own profile
-- (onboarding, active course), which is their own data and stays allowed.

drop policy if exists "profiles_anonymous_self_only" on public.profiles;
create policy "profiles_anonymous_self_only"
  on public.profiles
  as restrictive
  for select
  to authenticated
  using (
    (select (auth.jwt() ->> 'is_anonymous')::boolean) is not true
    or id = (select auth.uid())
  );

-- ============================================================================
-- SECURITY DEFINER function guards
-- These run as the function owner and bypass RLS, so the policies above do not
-- protect them — each needs its own anonymous check. Bodies are otherwise
-- unchanged from migration 0003.
-- ============================================================================

-- ------------------------------------------------------ send_friend_request
-- Guests can't send friend requests at all. Returns 'anonymous' so the UI can
-- nudge them to create a real account (see AddFriend.tsx).

create or replace function public.send_friend_request(p_username text)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_them uuid;
begin
  if v_me is null then
    raise exception 'must be signed in';
  end if;

  -- Anonymous guests are not part of the social graph.
  if (auth.jwt() ->> 'is_anonymous')::boolean is true then
    return 'anonymous';
  end if;

  select id into v_them from public.profiles where username = lower(p_username);
  if v_them is null then
    return 'not_found';
  end if;
  if v_them = v_me then
    return 'self';
  end if;

  -- Already connected (in either direction)?
  if exists (
    select 1 from public.friendships
    where (requester_id = v_me and addressee_id = v_them)
       or (requester_id = v_them and addressee_id = v_me)
  ) then
    return 'exists';
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (v_me, v_them, 'pending');
  return 'sent';
end;
$$;

grant execute on function public.send_friend_request(text) to authenticated;

-- ---------------------------------------------------------- accepted_friends
-- A permanent user can list anyone's friends (public stats). A guest may only
-- ever query their own id — for which they have no friends anyway — so this
-- returns nothing when a guest asks about another account.

create or replace function public.accepted_friends(p_user uuid)
returns table (
  id uuid,
  username text,
  display_name text,
  xp integer,
  streak_days integer
)
language sql
security definer set search_path = ''
stable
as $$
  select p.id, p.username, p.display_name, p.xp, p.streak_days
  from public.friendships f
  join public.profiles p
    on p.id = case when f.requester_id = p_user then f.addressee_id else f.requester_id end
  where f.status = 'accepted'
    and (f.requester_id = p_user or f.addressee_id = p_user)
    and (
      (auth.jwt() ->> 'is_anonymous')::boolean is not true
      or p_user = auth.uid()
    )
  order by p.xp desc;
$$;

grant execute on function public.accepted_friends(uuid) to authenticated;

-- ---------------------------------------------------------------- xp_per_day
-- Same rule: permanent users can render anyone's activity chart; a guest gets
-- data only for their own id (so their own profile still shows real activity),
-- and an empty series for anyone else.

create or replace function public.xp_per_day(p_user uuid, p_days integer default 14)
returns table (day date, xp integer)
language sql
security definer set search_path = ''
stable
as $$
  with days as (
    select (current_date - g)::date as day
    from generate_series(0, greatest(p_days, 1) - 1) as g
  )
  select d.day,
         coalesce(sum(lc.xp_earned), 0)::integer as xp
  from days d
  left join public.lesson_completions lc
    on lc.user_id = p_user
   and (lc.completed_at at time zone 'utc')::date = d.day
  where (auth.jwt() ->> 'is_anonymous')::boolean is not true
     or p_user = auth.uid()
  group by d.day
  order by d.day;
$$;

grant execute on function public.xp_per_day(uuid, integer) to authenticated;
