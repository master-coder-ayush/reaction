import { LEVELS, levelForXp } from "@/lib/constants";

// ---------------------------------------------------------------------------
// XP award table (from PLAN.md §5 "XP Awards")
// ---------------------------------------------------------------------------

export const XP_AWARDS = {
  CORRECT_EASY: 10,
  CORRECT_MEDIUM: 20,
  CORRECT_HARD: 30,
  REACTION_OF_THE_DAY: 50,
  BOSS_CLEARED: 200,
  PATHWAY_COMPLETED: 80,
  TIMED_PER_CORRECT: 15,
} as const;

export type XpAction = keyof typeof XP_AWARDS;

/** Map a reaction difficulty (1-3) to its correct-answer XP. */
export function xpForDifficulty(difficulty: number): number {
  switch (difficulty) {
    case 3:
      return XP_AWARDS.CORRECT_HARD;
    case 2:
      return XP_AWARDS.CORRECT_MEDIUM;
    default:
      return XP_AWARDS.CORRECT_EASY;
  }
}

// ---------------------------------------------------------------------------
// Level helpers
// ---------------------------------------------------------------------------

export type LevelInfo = {
  level: number;
  title: string;
  /** XP at which the current level began. */
  levelFloor: number;
  /** XP needed to reach the next level, or null if at max level. */
  nextLevelXp: number | null;
  /** XP earned within the current level band. */
  xpIntoLevel: number;
  /** XP span of the current level band (next floor − current floor), or null at max. */
  xpForLevelSpan: number | null;
  /** 0-1 progress through the current level band (1 when maxed). */
  progress: number;
};

/** Full level breakdown for an XP total — used by the XP progress bar. */
export function levelInfo(xp: number): LevelInfo {
  const level = levelForXp(xp);
  const idx = level - 1;
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;

  const levelFloor = current.xpRequired;
  const nextLevelXp = next ? next.xpRequired : null;
  const xpIntoLevel = xp - levelFloor;
  const xpForLevelSpan = next ? next.xpRequired - levelFloor : null;
  const progress =
    xpForLevelSpan && xpForLevelSpan > 0
      ? Math.min(1, xpIntoLevel / xpForLevelSpan)
      : 1;

  return {
    level,
    title: current.title,
    levelFloor,
    nextLevelXp,
    xpIntoLevel,
    xpForLevelSpan,
    progress,
  };
}

// ---------------------------------------------------------------------------
// Award result
// ---------------------------------------------------------------------------

export type AwardResult = {
  previousXp: number;
  newXp: number;
  awarded: number;
  previousLevel: number;
  newLevel: number;
  /** True when one or more level thresholds were crossed by this award. */
  leveledUp: boolean;
  /** Title of the new level (for the level-up toast). */
  newLevelTitle: string;
};

/**
 * Pure XP application: given a current total and an amount to add, return the
 * new total, recalculated level, and whether a level-up occurred. Shared by the
 * server award route and the client guest path so both stay consistent.
 */
export function applyXp(currentXp: number, amount: number): AwardResult {
  const previousXp = Math.max(0, Math.floor(currentXp));
  const awarded = Math.max(0, Math.floor(amount));
  const newXp = previousXp + awarded;

  const previousLevel = levelForXp(previousXp);
  const newLevel = levelForXp(newXp);

  return {
    previousXp,
    newXp,
    awarded,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
    newLevelTitle: LEVELS[newLevel - 1].title,
  };
}
