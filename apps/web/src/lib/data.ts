import type {
  Course,
  CourseWithLessons,
  Friend,
  FriendRequest,
  Lesson,
  LessonBlock,
  LessonCompletion,
  LessonSummary,
  Profile,
  XpDay,
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
  goal: string | null;
  onboarded: boolean | null;
}

const PROFILE_COLS =
  "id, username, display_name, avatar_url, xp, streak_days, last_active_date, active_course_id, created_at, goal, onboarded";

function mapProfile(row: ProfileRow): Profile {
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
    goal: row.goal ?? null,
    onboarded: row.onboarded ?? false,
  };
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
    .select(PROFILE_COLS)
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLS)
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

/** Accepted friends (the other side of the edge), via the 0003 RPC. */
export async function getFriends(userId: string): Promise<Friend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accepted_friends", {
    p_user: userId,
  });
  if (error || !data) return [];
  return (data as ProfileRow[]).map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    xp: r.xp,
    streakDays: r.streak_days,
  }));
}

/** Incoming pending friend requests for the signed-in user. */
export async function getFriendRequests(
  userId: string,
): Promise<FriendRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("requester_id, created_at, profiles!friendships_requester_id_fkey(username)")
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (
    data as {
      requester_id: string;
      created_at: string;
      profiles: { username: string } | { username: string }[] | null;
    }[]
  ).map((r) => {
    const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      fromId: r.requester_id,
      fromUsername: prof?.username ?? "someone",
      createdAt: r.created_at,
    };
  });
}

/**
 * XP earned per day over the last `days` days (oldest → newest), zero-filled.
 * Derived from lesson_completions; `todayISO` keeps it testable / TZ-stable.
 */
export function buildXpPerDay(
  completions: LessonCompletion[],
  todayISO: string,
  days = 14,
): XpDay[] {
  const byDate = new Map<string, number>();
  for (const c of completions) {
    const date = c.completedAt.slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + c.xpEarned);
  }
  const out: XpDay[] = [];
  const today = new Date(todayISO + "T00:00:00Z");
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ date: iso, xp: byDate.get(iso) ?? 0 });
  }
  return out;
}

/** XP earned today (UTC), for the daily-goal ring. */
export function xpEarnedToday(
  completions: LessonCompletion[],
  todayISO: string,
): number {
  return completions
    .filter((c) => c.completedAt.slice(0, 10) === todayISO)
    .reduce((s, c) => s + c.xpEarned, 0);
}

/** Default daily XP goal — the anti-cram nudge target. */
export const DAILY_XP_GOAL = 30;

/**
 * XP per day for any user via the security-definer RPC (so it works on other
 * people's public profiles too). Falls back to an empty zero-filled series.
 */
export async function getXpPerDay(
  userId: string,
  days = 14,
): Promise<XpDay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("xp_per_day", {
    p_user: userId,
    p_days: days,
  });
  if (error || !data) {
    const todayISO = new Date().toISOString().slice(0, 10);
    return buildXpPerDay([], todayISO, days);
  }
  return (data as { day: string; xp: number }[]).map((r) => ({
    date: r.day,
    xp: r.xp,
  }));
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
