import type { Lesson, UserProgress } from "../types";

/** Cumulative XP required to reach each level. Index = level - 1. */
const LEVEL_THRESHOLDS = [0, 50, 120, 220, 360, 540, 760, 1020, 1320, 1660];

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  /** XP span of the current level, or null at max level. */
  xpForNextLevel: number | null;
  /** 0..1 progress toward the next level (1 at max level). */
  progressPct: number;
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const currentFloor = LEVEL_THRESHOLDS[level - 1];
  const nextFloor = LEVEL_THRESHOLDS[level] ?? null;
  const xpIntoLevel = xp - currentFloor;
  const xpForNextLevel = nextFloor === null ? null : nextFloor - currentFloor;
  const progressPct = xpForNextLevel ? xpIntoLevel / xpForNextLevel : 1;
  return { level, xpIntoLevel, xpForNextLevel, progressPct };
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00Z").getTime();
  const to = new Date(toISO + "T00:00:00Z").getTime();
  return Math.round((to - from) / 86_400_000);
}

/**
 * Pure progress update. Returns a NEW UserProgress with the lesson's XP added
 * and the streak recomputed.
 *
 * `todayISO` is passed in (never read from the system clock here) so this stays
 * a pure function — trivial to unit-test and identical on web and mobile.
 */
export function completeLesson(
  progress: UserProgress,
  lesson: Lesson,
  todayISO: string,
): UserProgress {
  const alreadyDone = progress.completedLessonIds.includes(lesson.id);

  let streakDays = progress.streakDays;
  if (progress.lastActiveDate === null) {
    streakDays = 1;
  } else {
    const gap = daysBetween(progress.lastActiveDate, todayISO);
    if (gap === 0) {
      streakDays = Math.max(streakDays, 1); // same day, streak unchanged
    } else if (gap === 1) {
      streakDays = streakDays + 1; // consecutive day, streak grows
    } else if (gap > 1) {
      streakDays = 1; // missed a day, streak resets
    }
  }

  return {
    xp: progress.xp + (alreadyDone ? 0 : lesson.xp),
    streakDays,
    completedLessonIds: alreadyDone
      ? progress.completedLessonIds
      : [...progress.completedLessonIds, lesson.id],
    lastActiveDate: todayISO,
  };
}
