-- ============================================================================
-- LIFESKL — finalize the catalog to exactly 7 courses.
--
-- Run in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste
-- → Run). Safe to run more than once (idempotent).
--
-- The finalized 7 (this is also the order shown on the landing page):
--   1. Personal Finance        (personal-finance)  — has real lessons, KEEP
--   2. How to Learn            (how-to-learn)      — has real lessons, KEEP
--   3. Emotional Intelligence  (emotional-*)        — has real lessons, KEEP
--   4. Health & Mind           (health)            — placeholder shell, reshape
--   5. Relationships           (relationships)     — placeholder shell, reshape
--   6. Digital Life            (digital)           — placeholder shell, reshape
--   7. Career & Work           (career)            — placeholder shell, reshape
--
-- SAFETY: this script DELETES only the three retired tracks by name
-- (money, home, cooking). It never deletes by "everything except the keepers",
-- so a data-bearing course can't be wiped even if its slug differs from what
-- we expect. Deleting a course cascades to its lessons / completions /
-- enrollments — that's why deletion is an explicit allow-list of retired slugs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 0 — DOUBLE-CHECK FIRST (run this on its own before anything below).
-- Shows every course with how many lessons and how many user completions it
-- has, so you can confirm which courses actually hold data.
-- ----------------------------------------------------------------------------
-- select
--   c.sort_order, c.slug, c.title, c.emoji, c.is_published,
--   (select count(*) from public.lessons l where l.course_id = c.id) as lessons,
--   (select count(*) from public.lesson_completions lc
--      join public.lessons l on l.id = lc.lesson_id
--      where l.course_id = c.id) as completions,
--   (select count(*) from public.course_enrollments e where e.course_id = c.id)
--     as enrollments
-- from public.courses c
-- order by c.sort_order;

begin;

-- ----------------------------------------------------------------------------
-- STEP 1 — Remove the retired tracks (explicit allow-list; nothing else).
--   money    → replaced by Personal Finance
--   home     → dropped from the finalized curriculum
--   cooking  → dropped from the finalized curriculum
-- ----------------------------------------------------------------------------
delete from public.courses
where slug in ('money', 'home', 'cooking');

-- ----------------------------------------------------------------------------
-- STEP 2 — Reshape the 4 placeholder shells to the finalized copy + order.
-- These rows only ever held the original sample lessons from seed.sql, so
-- updating their metadata is non-destructive (no cascade). Their real
-- curriculum content gets seeded later via the content pipeline.
-- ----------------------------------------------------------------------------
update public.courses set
  title       = 'Health & Mind',
  description = 'Stress, sleep, anxiety, habits & burnout.',
  emoji       = '🧘',
  sort_order  = 4,
  is_published = true
where slug = 'health';

update public.courses set
  title       = 'Relationships',
  description = 'Boundaries, conflict, communication & dating.',
  emoji       = '💬',
  sort_order  = 5,
  is_published = true
where slug = 'relationships';

update public.courses set
  title       = 'Digital Life',
  description = 'Privacy, scams, passwords & staying safe online.',
  emoji       = '🔐',
  sort_order  = 6,
  is_published = true
where slug = 'digital';

update public.courses set
  title       = 'Career & Work',
  description = 'Resumes, interviews, negotiation & email.',
  emoji       = '💼',
  sort_order  = 7,
  is_published = true
where slug = 'career';

-- ----------------------------------------------------------------------------
-- STEP 3 — Put the 3 data-bearing courses in the right order.
-- sort_order / description only — NON-destructive, no lessons touched. Comment
-- these 3 lines out if you'd rather not touch the data courses at all; the only
-- effect is their position in the catalog list.
-- ----------------------------------------------------------------------------
update public.courses set sort_order = 1 where slug = 'personal-finance';
update public.courses set sort_order = 2 where slug = 'how-to-learn';
update public.courses set sort_order = 3 where slug = 'emotional-intelligence';

commit;

-- ----------------------------------------------------------------------------
-- OPTIONAL — clear the stale sample lessons left on the 4 reshaped shells so
-- they show as clean (empty) tracks until their real content is seeded.
-- DESTRUCTIVE for those 4 placeholder courses only (and any test completions
-- on them). Uncomment to use.
-- ----------------------------------------------------------------------------
-- delete from public.lessons
-- where course_id in (
--   select id from public.courses
--   where slug in ('health', 'relationships', 'digital', 'career')
-- );

-- ----------------------------------------------------------------------------
-- STEP 4 — VERIFY. Should return exactly the finalized 7 in order 1..7.
-- ----------------------------------------------------------------------------
select
  c.sort_order, c.slug, c.title, c.emoji, c.is_published,
  (select count(*) from public.lessons l where l.course_id = c.id) as lessons
from public.courses c
order by c.sort_order;
