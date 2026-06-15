import type { Course, CourseWithLessons, Lesson } from "@lifeskl/core";
import { LOCAL_COURSES } from "./localCatalog.generated";

// Offline-first course catalog. The /course journey and the lesson player read
// from this bundled copy so they always render — even with no Supabase session
// or a flaky connection. The data mirrors what seeds the database.

export { LOCAL_COURSES };

/** A local lesson id, as minted by scripts/build-local-catalog.mjs. */
export function isLocalLessonId(id: string): boolean {
  return id.includes("__");
}

export function getLocalCourse(idOrSlug: string): CourseWithLessons | null {
  return (
    LOCAL_COURSES.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null
  );
}

/** The default course to land on when nothing is chosen yet. */
export function defaultLocalCourse(): CourseWithLessons {
  // Personal Finance is the fully-authored course; fall back to the first.
  return getLocalCourse("personal-finance") ?? LOCAL_COURSES[0];
}

function courseFromWithLessons(c: CourseWithLessons): Course {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    emoji: c.emoji,
    sortOrder: c.sortOrder,
  };
}

/**
 * Full lesson (content blocks included) + its course, by local lesson id.
 * The heavy content module is imported lazily so the course page bundle stays
 * light — only the lesson route pays for it.
 */
export async function getLocalLesson(
  lessonId: string,
): Promise<{ lesson: Lesson; course: Course } | null> {
  const course = LOCAL_COURSES.find((c) =>
    c.lessons.some((l) => l.id === lessonId),
  );
  if (!course) return null;
  const summary = course.lessons.find((l) => l.id === lessonId);
  if (!summary) return null;

  const { LOCAL_LESSON_CONTENT } = await import("./localLessons.generated");
  const body = LOCAL_LESSON_CONTENT[lessonId] ?? {
    content: [],
    summaryPoints: [],
  };

  return {
    lesson: {
      ...summary,
      courseId: course.id,
      content: body.content,
      summaryPoints: body.summaryPoints,
    },
    course: courseFromWithLessons(course),
  };
}
