/**
 * Domain types shared across every client (web now, mobile later).
 *
 * These mirror the Supabase schema in /supabase/migrations — DB columns are
 * snake_case, these are camelCase; the mapping happens in the web app's data
 * layer (apps/web/src/lib/data.ts).
 */

// ---------------------------------------------------------------- profiles

export interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  streakDays: number;
  /** ISO date (YYYY-MM-DD) of the last completed lesson, or null. */
  lastActiveDate: string | null;
}

// ----------------------------------------------------------------- courses

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  sortOrder: number;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  sortOrder: number;
}

export interface Lesson extends LessonSummary {
  courseId: string;
  content: LessonBlock[];
}

export interface CourseWithLessons extends Course {
  lessons: LessonSummary[];
}

// ------------------------------------------------------------------ blocks
// A lesson is an ordered list of content blocks. This is what makes delivery
// flexible ("not one size fits all"): enriched material and interactive
// questions mix freely inside one lesson, and new block types can be added
// without schema changes (content lives in a JSONB column).

export interface MaterialBlock {
  type: "material";
  title?: string;
  /** Plain text; blank lines separate paragraphs. */
  body: string;
}

export interface MultipleChoiceBlock {
  type: "multiple_choice";
  prompt: string;
  options: string[];
  /** Index into `options` that is the correct answer. */
  correctIndex: number;
  explanation?: string;
}

export interface TrueFalseBlock {
  type: "true_false";
  prompt: string;
  answer: boolean;
  explanation?: string;
}

export type LessonBlock = MaterialBlock | MultipleChoiceBlock | TrueFalseBlock;

export const LESSON_BLOCK_TYPES = [
  "material",
  "multiple_choice",
  "true_false",
] as const;

// ----------------------------------------------------------------- friends

export type FriendshipStatus = "pending" | "accepted";

export interface Friendship {
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
}
