-- ============================================================================
-- LIFESKL — migration 0003: onboarding + a bit more social.
--
-- Run AFTER 0002_progress.sql in the Supabase SQL Editor.
--
-- Adds:
--   * profiles.goal       — what the learner picked in onboarding
--   * profiles.onboarded  — gate for the first-run onboarding flow
--   * accepted_friends()  — convenience RPC: my accepted friends with their stats
--
-- The profiles_protect_columns trigger from 0002 only guards
-- xp/streak/last_active_date, so goal/onboarded are editable by the owner
-- through the existing profiles_update_own policy. No policy changes needed.
-- ============================================================================

alter table public.profiles
  add column if not exists goal text,
  add column if not exists onboarded boolean not null default false;

-- Anyone who already has XP clearly doesn't need the first-run flow.
update public.profiles set onboarded = true where xp > 0 and onboarded = false;

-- ------------------------------------------------------- accepted friends RPC
-- Returns the *other* side of every accepted friendship for a given user,
-- with the public stats we show on profiles. SECURITY DEFINER so a profile
-- page can list someone else's friends (all profiles are already world-
-- readable to authenticated users via RLS, so this exposes nothing new).

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
  order by p.xp desc;
$$;

grant execute on function public.accepted_friends(uuid) to authenticated;

-- ------------------------------------------------------ add-friend by handle
-- Sends a friend request to a username. SECURITY DEFINER so we can resolve the
-- username → id and insert the row (the requester is always the caller).

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

-- ------------------------------------------------------- public XP-per-day
-- Daily XP totals for ANY user over the last p_days days. SECURITY DEFINER so
-- a visitor can render someone else's activity chart (lesson_completions is
-- owner-only under RLS); this exposes only a per-day sum, nothing sensitive.

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
  group by d.day
  order by d.day;
$$;

grant execute on function public.xp_per_day(uuid, integer) to authenticated;
