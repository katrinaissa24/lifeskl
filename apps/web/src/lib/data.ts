import type {
  Course,
  CourseWithLessons,
  Lesson,
  LessonBlock,
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
  is_published?: boolean;
  course_id?: string;
  content?: unknown;
}

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  streak_days: number;
  last_active_date: string | null;
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

export async function getCoursesWithLessons(): Promise<CourseWithLessons[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, emoji, sort_order, lessons(id, slug, title, description, xp_reward, sort_order, is_published)",
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

export async function getLessonWithCourse(
  lessonId: string,
): Promise<{ lesson: Lesson; course: Course } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, course_id, slug, title, description, xp_reward, sort_order, content, courses(id, slug, title, description, emoji, sort_order)",
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
    },
    course: mapCourse(row.courses),
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, xp, streak_days, last_active_date",
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
  };
}
