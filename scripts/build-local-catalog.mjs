#!/usr/bin/env node
// Builds a bundled, offline copy of the course catalog for the web app so the
// /course page (and the lesson player) always render even when Supabase is
// unreachable or the session has lapsed.
//
// Sources of truth (same data that seeds the DB):
//   • content/personal-finance/*.json  → the full "Personal Finance" course
//   • supabase/seed.sql                → the 7 catalog courses + starter lessons
//
// Output (committed):
//   • apps/web/src/lib/localCatalog.generated.ts   — courses + lesson summaries
//   • apps/web/src/lib/localLessons.generated.ts   — full lesson content blocks
//
// Lesson ids are synthesized as `${courseSlug}__${lessonSlug}` so they are
// stable and URL-safe for /lesson/[lessonId].
//
// Regenerate with: node scripts/build-local-catalog.mjs

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pfDir = join(root, "content", "personal-finance");
const seedPath = join(root, "supabase", "seed.sql");
const outDir = join(root, "apps", "web", "src", "lib");

const lessonId = (courseSlug, lessonSlug) => `${courseSlug}__${lessonSlug}`;

// ---- parse a stretch of SQL value tokens (quoted strings + numbers) ----------
function parseSqlValues(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === " " || ch === "\n" || ch === "\t" || ch === ",") {
      i++;
      continue;
    }
    if (ch === "'") {
      i++;
      let s = "";
      while (i < text.length) {
        if (text[i] === "'" && text[i + 1] === "'") {
          s += "'";
          i += 2;
        } else if (text[i] === "'") {
          i++;
          break;
        } else {
          s += text[i];
          i++;
        }
      }
      out.push(s);
    } else {
      let n = "";
      while (i < text.length && /[0-9.-]/.test(text[i])) {
        n += text[i];
        i++;
      }
      if (n) out.push(Number(n));
      else i++; // skip anything unexpected
    }
  }
  return out;
}

// ---- courses block from seed.sql --------------------------------------------
const seed = readFileSync(seedPath, "utf8");

const courses = []; // { slug, title, description, emoji, sortOrder }
const coursesBlock = seed.slice(
  seed.indexOf("insert into public.courses"),
  seed.indexOf("on conflict (slug) do nothing;"),
);
const courseRowRe =
  /\(\s*'([^']+)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'([^']*)'\s*,\s*(\d+)\s*\)/g;
let m;
while ((m = courseRowRe.exec(coursesBlock)) !== null) {
  courses.push({
    slug: m[1],
    title: m[2].replace(/''/g, "'"),
    description: m[3].replace(/''/g, "'"),
    emoji: m[4],
    sortOrder: Number(m[5]),
  });
}

// ---- lessons from seed.sql ---------------------------------------------------
const lessonsBySlug = {}; // courseSlug -> [lesson]
const content = {}; // lessonId -> { content, summaryPoints }

const lessonChunks = seed.split(/insert into public\.lessons\b/).slice(1);
for (const chunk of lessonChunks) {
  const jStart = chunk.indexOf("$json$");
  const jEnd = chunk.indexOf("$json$::jsonb", jStart + 6);
  if (jStart === -1 || jEnd === -1) continue;
  const contentJson = chunk.slice(jStart + 6, jEnd);
  let blocks;
  try {
    blocks = JSON.parse(contentJson);
  } catch (err) {
    throw new Error(`Failed to parse lesson content JSON: ${err.message}`);
  }

  const selIdx = chunk.indexOf("select id,");
  const head = chunk.slice(selIdx + "select id,".length, jStart);
  const [slug, title, description, xpReward, sortOrder] = parseSqlValues(head);

  const courseMatch = chunk
    .slice(jEnd)
    .match(/from public\.courses where slug = '([^']+)'/);
  if (!courseMatch) continue;
  const courseSlug = courseMatch[1];

  const id = lessonId(courseSlug, slug);
  (lessonsBySlug[courseSlug] ??= []).push({
    id,
    slug,
    title,
    description,
    xpReward,
    sortOrder,
    unit: 1,
  });
  content[id] = { content: blocks, summaryPoints: [] };
}

// ---- personal-finance course from content JSON ------------------------------
const PF = {
  slug: "personal-finance",
  title: "Personal Finance",
  description:
    "Budgets, saving, credit, investing, scams & taxes — money skills for real life.",
  emoji: "💵",
  sortOrder: 0,
};
courses.push(PF);

const pfFiles = readdirSync(pfDir)
  .filter((f) => f.endsWith(".json"))
  .sort();
const pfLessons = pfFiles
  .map((f) => JSON.parse(readFileSync(join(pfDir, f), "utf8")))
  .sort((a, b) => a.sortOrder - b.sortOrder);

for (const l of pfLessons) {
  const id = lessonId(PF.slug, l.slug);
  (lessonsBySlug[PF.slug] ??= []).push({
    id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    xpReward: l.xpReward,
    sortOrder: l.sortOrder,
    unit: l.unit ?? 1,
  });
  content[id] = {
    content: l.content,
    summaryPoints: l.summaryPoints ?? [],
  };
}

// ---- assemble + sort ---------------------------------------------------------
courses.sort((a, b) => a.sortOrder - b.sortOrder);
const catalog = courses.map((c) => ({
  id: c.slug, // local id === slug; stable & human-readable
  slug: c.slug,
  title: c.title,
  description: c.description,
  emoji: c.emoji,
  sortOrder: c.sortOrder,
  lessons: (lessonsBySlug[c.slug] ?? []).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  ),
}));

// ---- emit --------------------------------------------------------------------
const banner = (extra) =>
  `// AUTO-GENERATED by scripts/build-local-catalog.mjs — do not edit by hand.\n// Regenerate with: node scripts/build-local-catalog.mjs\n${extra}\n`;

const catalogTs =
  banner(`import type { CourseWithLessons } from "@lifeskl/core";`) +
  `\nexport const LOCAL_COURSES: CourseWithLessons[] = ${JSON.stringify(
    catalog,
    null,
    2,
  )};\n`;

const lessonsTs =
  banner(`import type { LessonBlock } from "@lifeskl/core";`) +
  `\nexport const LOCAL_LESSON_CONTENT: Record<\n  string,\n  { content: LessonBlock[]; summaryPoints: string[] }\n> = ${JSON.stringify(content, null, 2)};\n`;

writeFileSync(join(outDir, "localCatalog.generated.ts"), catalogTs);
writeFileSync(join(outDir, "localLessons.generated.ts"), lessonsTs);

const lessonCount = Object.keys(content).length;
console.log(
  `Wrote localCatalog.generated.ts (${catalog.length} courses) and ` +
    `localLessons.generated.ts (${lessonCount} lessons, ` +
    `${(lessonsTs.length / 1024).toFixed(0)} KB).`,
);
