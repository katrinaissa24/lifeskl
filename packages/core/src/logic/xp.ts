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
 * Pure streak math, shared by web and (later) mobile. `todayISO` is passed in
 * rather than read from the clock so this stays trivially testable.
 *
 * Same day → unchanged; consecutive day → +1; gap → reset to 1.
 */
export function nextStreakDays(
  lastActiveDate: string | null,
  todayISO: string,
  currentStreak: number,
): number {
  if (lastActiveDate === null) return 1;
  const gap = daysBetween(lastActiveDate, todayISO);
  if (gap === 0) return Math.max(currentStreak, 1);
  if (gap === 1) return currentStreak + 1;
  return 1;
}
