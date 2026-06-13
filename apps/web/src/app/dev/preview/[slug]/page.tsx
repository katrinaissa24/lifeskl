import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Course, Lesson } from "@lifeskl/core";
import { LessonPlayer } from "@/app/lesson/[lessonId]/LessonPlayer";

// DEV ONLY: plays a lesson straight from content/personal-finance/*.json so
// content can be authored and play-tested without touching Supabase.
// /dev/preview/list shows everything available.

const CONTENT_DIR = join(process.cwd(), "..", "..", "content", "personal-finance");

const PREVIEW_COURSE: Course = {
  id: "preview-course",
  slug: "personal-finance",
  title: "Personal Finance",
  description: "Preview",
  emoji: "💵",
  sortOrder: 0,
};

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
  let files: string[];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    notFound();
  }

  if (slug === "list") {
    return (
      <main className="wrap" style={{ padding: "40px 0" }}>
        <h1>Lesson previews (dev)</h1>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f) => {
            const s = f.replace(/^\d+-/, "").replace(/\.json$/, "");
            return (
              <Link key={f} href={`/dev/preview/${s}`} className="card card-pad card-hover">
                {f}
              </Link>
            );
          })}
        </div>
      </main>
    );
  }

  const file = files.find((f) => f.replace(/^\d+-/, "").replace(/\.json$/, "") === slug);
  if (!file) notFound();

  const raw = JSON.parse(readFileSync(join(CONTENT_DIR, file), "utf8"));
  const lesson: Lesson = {
    id: `preview-${raw.slug}`,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    xpReward: raw.xpReward,
    sortOrder: raw.sortOrder,
    unit: raw.unit,
    courseId: PREVIEW_COURSE.id,
    // ?from=N jumps ahead by slicing earlier blocks off — handy when testing
    // a block deep inside a lesson.
    content: raw.content.slice(Number(from ?? 0) || 0),
    summaryPoints: raw.summaryPoints,
  };

  return <LessonPlayer course={PREVIEW_COURSE} lesson={lesson} />;
}
