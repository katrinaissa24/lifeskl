import type { LessonCompletion, LessonSummary } from "@lifeskl/core";

// Pure journey-view logic, free of any server-only imports so it can be used
// from client components (the local-first course page) as well as the server.

export interface JourneyLesson extends LessonSummary {
  state: "done" | "current" | "locked";
}

/**
 * The journey view: lessons in course order, each marked done / current /
 * locked. The first uncompleted lesson is "current"; everything after it is
 * locked until the path catches up.
 */
export function buildJourney(
  lessons: LessonSummary[],
  completions: LessonCompletion[],
): JourneyLesson[] {
  const done = new Set(completions.map((c) => c.lessonId));
  let currentAssigned = false;
  return lessons.map((lesson) => {
    if (done.has(lesson.id)) return { ...lesson, state: "done" as const };
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...lesson, state: "current" as const };
    }
    return { ...lesson, state: "locked" as const };
  });
}
