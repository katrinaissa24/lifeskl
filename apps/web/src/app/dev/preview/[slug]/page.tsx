import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Course, Lesson } from "@lifeskl/core";
import { LessonPlayer } from "@/app/lesson/[lessonId]/LessonPlayer";

// DEV ONLY: plays a lesson straight from content/<course>/*.json so content
// can be authored and play-tested without touching Supabase. Scans every
// course folder under /content. /dev/preview/list shows everything available.

const CONTENT_ROOT = join(process.cwd(), "..", "..", "content");

interface CourseMeta {
  slug: string;
  title: string;
  description?: string;
  emoji?: string;
  sortOrder?: number;
}

function courseDirs(): string[] {
  try {
    return readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(CONTENT_ROOT, d.name, "course.json")))
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function courseMeta(dir: string): CourseMeta {
  try {
    return JSON.parse(readFileSync(join(CONTENT_ROOT, dir, "course.json"), "utf8")) as CourseMeta;
  } catch {
    return { slug: dir, title: dir };
  }
}

function lessonFiles(dir: string): string[] {
  return readdirSync(join(CONTENT_ROOT, dir)).filter(
    (f) => f.endsWith(".json") && f !== "course.json",
  );
}

const lessonSlug = (file: string) => file.replace(/^\d+-/, "").replace(/\.json$/, "");

export default async function DevPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { slug } = await params;
  const { from } = await searchParams;
  const dirs = courseDirs();

  if (slug === "list") {
    return (
      <main className="wrap" style={{ padding: "40px 0" }}>
        <h1>Lesson previews (dev)</h1>
        {dirs.map((dir) => {
          const meta = courseMeta(dir);
          return (
            <div key={dir} style={{ marginTop: 28 }}>
              <h2 style={{ marginBottom: 12 }}>
                {meta.emoji} {meta.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lessonFiles(dir)
                  .sort()
                  .map((f) => (
                    <Link
                      key={f}
                      href={`/dev/preview/${lessonSlug(f)}`}
                      className="card card-pad card-hover"
                    >
                      {f}
                    </Link>
                  ))}
              </div>
            </div>
          );
        })}
      </main>
    );
  }

  // Find the lesson file (and its course) by slug across every course folder.
  let found: { dir: string; file: string } | null = null;
  for (const dir of dirs) {
    const file = lessonFiles(dir).find((f) => lessonSlug(f) === slug);
    if (file) {
      found = { dir, file };
      break;
    }
  }
  if (!found) notFound();

  const meta = courseMeta(found.dir);
  const previewCourse: Course = {
    id: "preview-course",
    slug: meta.slug,
    title: meta.title,
    description: meta.description ?? "Preview",
    emoji: meta.emoji ?? "✦",
    sortOrder: meta.sortOrder ?? 0,
  };

  const raw = JSON.parse(readFileSync(join(CONTENT_ROOT, found.dir, found.file), "utf8"));
  const lesson: Lesson = {
    id: `preview-${raw.slug}`,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    xpReward: raw.xpReward,
    sortOrder: raw.sortOrder,
    unit: raw.unit,
    courseId: previewCourse.id,
    // ?from=N jumps ahead by slicing earlier blocks off — handy when testing
    // a block deep inside a lesson.
    content: raw.content.slice(Number(from ?? 0) || 0),
    summaryPoints: raw.summaryPoints,
  };

  return <LessonPlayer course={previewCourse} lesson={lesson} />;
}
