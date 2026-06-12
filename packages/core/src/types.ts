/**
 * Domain types shared across every client.
 *
 * This file is the contract between frontend and backend, and between web and
 * mobile. If a shape lives here, both platforms agree on it.
 */

export type ExerciseType = "multiple-choice" | "true-false";

export interface MultipleChoiceExercise {
  id: string;
  type: "multiple-choice";
  prompt: string;
  options: string[];
  /** Index into `options` that is the correct answer. */
  correctIndex: number;
  explanation?: string;
}

export interface TrueFalseExercise {
  id: string;
  type: "true-false";
  prompt: string;
  answer: boolean;
  explanation?: string;
}

export type Exercise = MultipleChoiceExercise | TrueFalseExercise;

export interface Lesson {
  id: string;
  title: string;
  /** XP awarded for completing the lesson. */
  xp: number;
  exercises: Exercise[];
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Tailwind-friendly accent color name, e.g. "emerald". */
  color: string;
  emoji: string;
  lessons: Lesson[];
}

export interface UserProgress {
  xp: number;
  streakDays: number;
  /** Ids of lessons the user has finished. */
  completedLessonIds: string[];
  /** ISO date (YYYY-MM-DD) of the user's last completed lesson, or null. */
  lastActiveDate: string | null;
}

export const EMPTY_PROGRESS: UserProgress = {
  xp: 0,
  streakDays: 0,
  completedLessonIds: [],
  lastActiveDate: null,
};
