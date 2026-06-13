import type {
  Course,
  CourseWithLessons,
  Lesson,
  LessonBlock,
  LessonCompletion,
  LessonSummary,
  Profile,
} from "@lifeskl/core";
import { LESSON_BLOCK_TYPES } from "@lifeskl/core";
import { createClient } from "@/lib/supabase/server";

// Server-side fetchers. Supabase returns snake_case rows; everything leaves
// this file as the camelCase types from @lifeskl/core.

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  sort_order: number;
}

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  xp_reward: number;
  sort_order: number;
  unit?: number;
  is_published?: boolean;
  course_id?: string;
  content?: unknown;
  summary_points?: unknown;
}

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  streak_days: number;
  last_active_date: string | null;
  active_course_id: string | null;
  created_at: string | null;
}

interface CompletionRow {
  lesson_id: string;
  completed_at: string;
  correct_count: number;
  total_count: number;
  xp_earned: number;
}

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    sortOrder: row.sort_order,
  };
}

function mapLessonSummary(row: LessonRow): LessonSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    xpReward: row.xp_reward,
    sortOrder: row.sort_order,
    unit: row.unit ?? 1,
  };
}

function parseBlocks(content: unknown): LessonBlock[] {
  if (!Array.isArray(content)) return [];
  return content.filter(
    (b): b is LessonBlock =>
      typeof b === "object" &&
      b !== null &&
      (LESSON_BLOCK_TYPES as readonly string[]).includes(
        (b as { type?: string }).type ?? "",
      ),
  );
}

function parseSummaryPoints(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is string => typeof p === "string");
}

const LESSON_SUMMARY_COLS =
  "id, slug, title, description, xp_reward, sort_order, unit, is_published";

export async function getCoursesWithLessons(): Promise<CourseWithLessons[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, description, emoji, sort_order, lessons(${LESSON_SUMMARY_COLS})`,
    )
    .eq("is_published", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "lessons" });

  if (error || !data) return [];

  return (data as (CourseRow & { lessons: LessonRow[] | null })[]).map(
    (row) => ({
      ...mapCourse(row),
      lessons: (row.lessons ?? [])
        .filter((l) => l.is_published !== false)
        .map(mapLessonSummary),
    }),
  );
}

export async function getCourseWithLessons(
  courseId: string,
): Promise<CourseWithLessons | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, description, emoji, sort_order, lessons(${LESSON_SUMMARY_COLS})`,
    )
    .eq("id", courseId)
    .eq("is_published", true)
    .order("sort_order", { referencedTable: "lessons" })
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as CourseRow & { lessons: LessonRow[] | null };
  return {
    ...mapCourse(row),
    lessons: (row.lessons ?? [])
      .filter((l) => l.is_published !== false)
      .map(mapLessonSummary),
  };
}

export async function getLessonWithCourse(
  lessonId: string,
): Promise<{ lesson: Lesson; course: Course } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, course_id, slug, title, description, xp_reward, sort_order, unit, content, summary_points, courses(id, slug, title, description, emoji, sort_order)",
    )
    .eq("id", lessonId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as LessonRow & { courses: CourseRow };
  return {
    lesson: {
      ...mapLessonSummary(row),
      courseId: row.course_id ?? row.courses.id,
      content: parseBlocks(row.content),
      summaryPoints: parseSummaryPoints(row.summary_points),
    },
    course: mapCourse(row.courses),
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, xp, streak_days, last_active_date, active_course_id, created_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as ProfileRow;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    xp: row.xp,
    streakDays: row.streak_days,
    lastActiveDate: row.last_active_date,
    activeCourseId: row.active_course_id ?? null,
    createdAt: row.created_at ?? null,
  };
}

export async function getCompletions(
  userId: string,
): Promise<LessonCompletion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_completions")
    .select("lesson_id, completed_at, correct_count, total_count, xp_earned")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error || !data) return [];

  return (data as CompletionRow[]).map((row) => ({
    lessonId: row.lesson_id,
    completedAt: row.completed_at,
    correctCount: row.correct_count,
    totalCount: row.total_count,
    xpEarned: row.xp_earned,
  }));
}

export async function getEnrolledCourseIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return (data as { course_id: string }[]).map((r) => r.course_id);
}

// ------------------------------------------------------------ derived views

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
