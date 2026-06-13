#!/usr/bin/env node
// Builds supabase/seed_personal_finance.sql from content/personal-finance/*.json.
// Run the validator first; this script refuses invalid files implicitly by
// being dumb — it just assembles SQL.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "personal-finance");
const outFile = join(root, "supabase", "seed_personal_finance.sql");

const files = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json"))
  .sort();

const lessons = files.map((f) => JSON.parse(readFileSync(join(contentDir, f), "utf8")));
lessons.sort((a, b) => a.sortOrder - b.sortOrder);

const esc = (s) => String(s).replace(/'/g, "''");
const dollarJson = (value) => {
  const json = JSON.stringify(value);
  if (json.includes("$json$")) throw new Error("content contains $json$ delimiter");
  return `$json$${json}$json$::jsonb`;
};

let sql = `-- ============================================================================
-- LIFESKL — Personal Finance course seed (generated from content/personal-finance)
-- Regenerate with: node scripts/build-seed.mjs
-- Run AFTER migrations 0001 + 0002, in the Supabase SQL Editor. Idempotent:
-- re-running updates lesson content in place.
-- ============================================================================

insert into public.courses (slug, title, description, emoji, sort_order)
values (
  'personal-finance',
  'Personal Finance',
  'Budgets, saving, credit, investing, scams & taxes — money skills for real life.',
  '💵',
  0
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order;

`;

for (const lesson of lessons) {
  sql += `-- ---------------------------------------------------------------- ${lesson.slug}
insert into public.lessons
  (course_id, slug, title, description, xp_reward, sort_order, unit, content, summary_points)
select
  id,
  '${esc(lesson.slug)}',
  '${esc(lesson.title)}',
  '${esc(lesson.description)}',
  ${lesson.xpReward},
  ${lesson.sortOrder},
  ${lesson.unit},
  ${dollarJson(lesson.content)},
  ${dollarJson(lesson.summaryPoints)}
from public.courses where slug = 'personal-finance'
on conflict (course_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  xp_reward = excluded.xp_reward,
  sort_order = excluded.sort_order,
  unit = excluded.unit,
  content = excluded.content,
  summary_points = excluded.summary_points;

`;
}

sql += `-- Remove any personal-finance lessons that are no longer in the content set.
delete from public.lessons
where course_id = (select id from public.courses where slug = 'personal-finance')
  and slug not in (${lessons.map((l) => `'${esc(l.slug)}'`).join(", ")});
`;

writeFileSync(outFile, sql);
console.log(`Wrote ${outFile} (${lessons.length} lessons, ${(sql.length / 1024).toFixed(0)} KB)`);
