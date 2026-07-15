-- ============================================================================
-- LIFESKL — migration 0004: support anonymous sign-in.
--
-- Run AFTER 0003_onboarding_social.sql in the Supabase SQL Editor.
--
-- Anonymous users (Supabase "Continue without signing in") arrive with BOTH
-- raw_user_meta_data.username AND email null. The original handle_new_user
-- computed `base` as null in that case, `if length(base) < 3` evaluated to
-- null (treated as false, so the 'learner' fallback was skipped), and the
-- insert hit the NOT NULL / regex constraint on profiles.username — which
-- made signInAnonymously() fail outright.
--
-- This rewrite makes the fallback fire whenever base is null OR too short, so
-- every anonymous user gets a valid "learner…" handle and a real profile row.
--
-- Remember to also enable it in the dashboard:
--   Authentication → Sign In / Providers → Anonymous → Allow anonymous sign-ins
-- ============================================================================

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
  -- base is null for anonymous users (no username, no email) — coalesce to ''
  -- so the length check below reliably triggers the 'learner' fallback.
  if coalesce(length(base), 0) < 3 then
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
