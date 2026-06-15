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
  /** Course the learner is currently working through, or null. */
  activeCourseId: string | null;
  createdAt: string | null;
  /** What the learner picked in onboarding (free-form goal key/label). */
  goal: string | null;
  /** Has the learner finished the first-run onboarding flow? */
  onboarded: boolean;
}

// --------------------------------------------------------------- social

export interface Friend {
  id: string;
  username: string;
  displayName: string | null;
  xp: number;
  streakDays: number;
}

export interface FriendRequest {
  /** The profile that sent the request. */
  fromId: string;
  fromUsername: string;
  createdAt: string;
}

/** One day's worth of XP, for the profile activity chart. */
export interface XpDay {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  xp: number;
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
  /** Journey grouping — "Level 1", "Level 2"… on the course map. */
  unit: number;
}

export interface Lesson extends LessonSummary {
  courseId: string;
  content: LessonBlock[];
  /** Bullet list shown on the completion screen ("What you learned"). */
  summaryPoints: string[];
}

export interface CourseWithLessons extends Course {
  lessons: LessonSummary[];
}

// ---------------------------------------------------------------- progress

export interface LessonCompletion {
  lessonId: string;
  completedAt: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: string;
}

/** What the complete_lesson RPC returns. */
export interface CompleteLessonResult {
  xpAwarded: number;
  newXp: number;
  streakDays: number;
  alreadyCompleted: boolean;
}

// ------------------------------------------------------------------ blocks
// A lesson is an ordered list of content blocks. This is what makes delivery
// flexible ("not one size fits all"): enriched material and interactive
// questions mix freely inside one lesson, and new block types can be added
// without schema changes (content lives in a JSONB column).
//
// Authoring rule: never more than 3 material blocks in a row — readers bail.

export interface MaterialBlock {
  type: "material";
  title?: string;
  /**
   * Plain text. Blank lines separate paragraphs; lines starting with "- "
   * render as a bulleted list; **bold** renders bold.
   */
  body: string;
  /** Optional illustration (path under /public, e.g. "/illustrations/budget.svg"). */
  image?: string;
  imageAlt?: string;
}

export interface MultipleChoiceBlock {
  type: "multiple_choice";
  prompt: string;
  /** Optional scenario set-up shown above the prompt. */
  context?: string;
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

/** Type the missing word/number. `prompt` contains "___" where it goes. */
export interface FillBlankBlock {
  type: "fill_blank";
  prompt: string;
  answer: string;
  /** Extra accepted answers (case-insensitive compare, $/, stripped). */
  accept?: string[];
  hint?: string;
  explanation?: string;
}

/** One word in the sentence is wrong — tap it. */
export interface TapWordBlock {
  type: "tap_word";
  instructions?: string;
  /** The sentence containing exactly one occurrence of `wrongWord`. */
  sentence: string;
  /** The incorrect word as it appears in `sentence` (punctuation-free). */
  wrongWord: string;
  /** What the word should have been. */
  correctWord: string;
  explanation?: string;
}

/** Connect terms to definitions by tapping pairs. */
export interface MatchPairsBlock {
  type: "match_pairs";
  prompt?: string;
  /** 3–5 pairs. Right sides are shuffled at render time. */
  pairs: { left: string; right: string }[];
}

/** Arrange steps into the right order. */
export interface OrderStepsBlock {
  type: "order_steps";
  prompt: string;
  /** Steps in CORRECT order (player shuffles for display). */
  steps: string[];
  explanation?: string;
}

/** Sort items into labeled buckets (e.g. Need / Want / Savings). */
export interface CategorizeBlock {
  type: "categorize";
  prompt: string;
  /** 2–3 bucket labels. */
  categories: string[];
  /** Each item names the index of its correct bucket. */
  items: { text: string; category: number }[];
}

/**
 * Finance: allocate a fixed income across categories with steppers.
 * Win when every need is exactly covered, savings meets the target, and the
 * total doesn't exceed income.
 */
export interface BudgetBuilderBlock {
  type: "budget_builder";
  prompt: string;
  income: number;
  /** Needs carry the bill amount that must be covered exactly. */
  categories: {
    name: string;
    emoji?: string;
    kind: "need" | "want" | "savings";
    /** Required allocation for needs (ignored for want/savings). */
    required?: number;
  }[];
  /** Minimum that must land in savings-kind categories. */
  savingsTarget: number;
  explanation?: string;
}

/** Drag a slider to estimate a value; correct within ±tolerance. */
export interface SliderEstimateBlock {
  type: "slider_estimate";
  prompt: string;
  min: number;
  max: number;
  step: number;
  answer: number;
  tolerance: number;
  /** Shown before the value, e.g. "$". */
  unitPrefix?: string;
  /** Shown after the value, e.g. " / year". */
  unitSuffix?: string;
  explanation?: string;
}

/**
 * Branching scenario with a running stat (credit score, savings…).
 * The block counts as "correct" when the best option was picked in at least
 * two-thirds of the steps.
 */
export interface DecisionPathBlock {
  type: "decision_path";
  title: string;
  intro?: string;
  stat: { name: string; emoji: string; start: number };
  steps: {
    situation: string;
    options: { text: string; delta: number; feedback: string; best?: boolean }[];
  }[];
  /** Shown with the final stat. */
  outro?: string;
}

/** A scammy message rendered like an email/SMS — tap every red flag. */
export interface SpotScamBlock {
  type: "spot_scam";
  prompt: string;
  messageFrom: string;
  messageSubject?: string;
  /** Body in tappable segments; a segment with `flag` is a red flag and the
   *  flag text explains why. 2–4 flagged segments per message. */
  segments: { text: string; flag?: string }[];
  explanation?: string;
}

/**
 * How to Learn: sort tasks into the Eisenhower priority matrix. Each task
 * declares whether it's urgent and/or important; the learner taps the quadrant
 * it belongs in (one task at a time, like categorize but on a 2×2 grid).
 * Correct = every task placed in its right quadrant with zero misses.
 */
export interface PriorityMatrixBlock {
  type: "priority_matrix";
  prompt: string;
  /** 4–8 tasks. All four urgent/important combinations should be represented. */
  tasks: { text: string; urgent: boolean; important: boolean }[];
  explanation?: string;
}

/**
 * How to Learn: plan review sessions to beat the forgetting curve. The learner
 * toggles candidate review points on a timeline; a live retention meter rewards
 * expanding intervals. Correct = the selected set exactly matches the
 * `recommended` spaced-repetition schedule.
 */
export interface SpacedPlannerBlock {
  type: "spaced_planner";
  prompt: string;
  /** What was just learned (labels the thing being scheduled). */
  topic?: string;
  /** 4–8 candidate review points; `recommended` marks the right spaced set. */
  points: { label: string; day: number; recommended: boolean }[];
  explanation?: string;
}

/**
 * How to Learn: an open reflection or commitment prompt. There is no wrong
 * answer — it ALWAYS reports success, so it never enters the mistake round.
 * Optional chips seed the answer; the explanation is the takeaway shown after.
 */
export interface ReflectBlock {
  type: "reflect";
  prompt: string;
  /** Optional scenario/context shown above the prompt. */
  context?: string;
  /** Optional quick-pick chips the learner can tap to seed their answer. */
  chips?: string[];
  /** Optional placeholder text for the input. */
  placeholder?: string;
  /** Optional takeaway shown once the learner commits their reflection. */
  explanation?: string;
}

/**
 * Emotional Intelligence: place a feeling on the RULER "Mood Meter" grid —
 * pleasantness (x-axis) × energy (y-axis). Four quadrants: Red (high energy,
 * unpleasant), Yellow (high energy, pleasant), Blue (low energy, unpleasant),
 * Green (low energy, pleasant). The learner taps the quadrant for each item;
 * correct = every item placed right with zero misses.
 */
export interface MoodMeterBlock {
  type: "mood_meter";
  prompt: string;
  /** 4–8 feelings/scenarios; all four energy×pleasant combos should appear. */
  items: { text: string; energy: "high" | "low"; pleasant: boolean }[];
  explanation?: string;
}

/**
 * Emotional Intelligence: assemble a non-blaming "I-statement" by choosing the
 * emotionally-intelligent option for each slot (the feeling, the trigger, …).
 * A live preview shows the assembled sentence. Correct = every slot's `ok`
 * option is chosen (each slot has at least one good option and one distractor).
 */
export interface IStatementBlock {
  type: "i_statement";
  prompt: string;
  /** Optional scenario shown above the prompt. */
  context?: string;
  /** 2–4 slots, each with 2–4 options. The `ok` options assemble the line. */
  slots: {
    label: string;
    options: { text: string; ok: boolean; why?: string }[];
  }[];
  explanation?: string;
}

export type QuestionBlock =
  | MultipleChoiceBlock
  | TrueFalseBlock
  | FillBlankBlock
  | TapWordBlock
  | MatchPairsBlock
  | OrderStepsBlock
  | CategorizeBlock
  | BudgetBuilderBlock
  | SliderEstimateBlock
  | DecisionPathBlock
  | SpotScamBlock
  | PriorityMatrixBlock
  | SpacedPlannerBlock
  | ReflectBlock
  | MoodMeterBlock
  | IStatementBlock;

export type LessonBlock = MaterialBlock | QuestionBlock;

export const LESSON_BLOCK_TYPES = [
  "material",
  "multiple_choice",
  "true_false",
  "fill_blank",
  "tap_word",
  "match_pairs",
  "order_steps",
  "categorize",
  "budget_builder",
  "slider_estimate",
  "decision_path",
  "spot_scam",
  "priority_matrix",
  "spaced_planner",
  "reflect",
  "mood_meter",
  "i_statement",
] as const;

export type LessonBlockType = (typeof LESSON_BLOCK_TYPES)[number];

// ----------------------------------------------------------------- friends

export type FriendshipStatus = "pending" | "accepted";

export interface Friendship {
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
}
