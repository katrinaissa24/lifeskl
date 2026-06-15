#!/usr/bin/env node
// Builds supabase/seed_<course>.sql from content/<course>/*.json.
// Usage:
//   node scripts/build-seed.mjs <course-slug>
//   node scripts/build-seed.mjs              (defaults to personal-finance)
//
// Course metadata (title, description, emoji, sortOrder) comes from
// content/<course-slug>/course.json. Run the validator first; this script is
// dumb — it just assembles SQL.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] || "personal-finance";
const contentDir = join(root, "content", slug);
const outFile = join(root, "supabase", `seed_${slug.replace(/-/g, "_")}.sql`);

const course = JSON.parse(readFileSync(join(contentDir, "course.json"), "utf8"));

const files = readdirSync(contentDir)
  .filter((f) => f.endsWith(".json") && f !== "course.json")
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
-- LIFESKL — ${course.title} course seed (generated from content/${slug})
-- Regenerate with: node scripts/build-seed.mjs ${slug}
-- Run AFTER migrations 0001–0003, in the Supabase SQL Editor. Idempotent:
-- re-running updates lesson content in place.
-- ============================================================================

insert into public.courses (slug, title, description, emoji, sort_order)
values (
  '${esc(course.slug)}',
  '${esc(course.title)}',
  '${esc(course.description)}',
  '${esc(course.emoji)}',
  ${course.sortOrder}
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
from public.courses where slug = '${esc(course.slug)}'
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

sql += `-- Remove any ${slug} lessons that are no longer in the content set.
delete from public.lessons
where course_id = (select id from public.courses where slug = '${esc(course.slug)}')
  and slug not in (${lessons.map((l) => `'${esc(l.slug)}'`).join(", ")});
`;

writeFileSync(outFile, sql);
console.log(`Wrote ${outFile} (${lessons.length} lessons, ${(sql.length / 1024).toFixed(0)} KB)`);
