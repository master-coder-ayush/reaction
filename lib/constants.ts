// Level thresholds (from PLAN.md). Index 0 == Level 1.
export const LEVELS: { level: number; xpRequired: number; title: string }[] = [
  { level: 1, xpRequired: 0, title: "Organic Beginner" },
  { level: 2, xpRequired: 200, title: "Reaction Rookie" },
  { level: 3, xpRequired: 500, title: "Hydrocarbon Hero" },
  { level: 4, xpRequired: 1000, title: "Aldehyde Ace" },
  { level: 5, xpRequired: 2000, title: "Conversion King" },
  { level: 6, xpRequired: 4000, title: "Reaction Ninja" },
  { level: 7, xpRequired: 8000, title: "Organic Grandmaster" },
];

/** Returns the level number (1-7) for a given XP total. */
export function levelForXp(xp: number): number {
  let level = 1;
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) level = l.level;
  }
  return level;
}

export const CLASS_LEVELS = ["11", "12", "both"] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

// localStorage keys for guest session (see PLAN.md Guest Access).
export const GUEST_XP_KEY = "luc_guest_xp";
export const GUEST_PROGRESS_KEY = "luc_guest_progress"; // JSON array of reaction ids attempted
export const GUEST_XP_LOG_KEY = "luc_guest_xp_log"; // JSON array of { amount, action, at }
// One-time welcome banner flag, set on the sign-up redirect.
export const WELCOME_NAME_KEY = "luc_welcome_name";

// ---------------------------------------------------------------------------
// Chapter map (PLAN.md §6 "Chapter Structure"). The boss-gating logic is
// stubbed in Sprint 2 — `unlockedBy` records the prerequisite chapter id, and
// chapter 1 is always unlocked. The real boss system lands in Sprint 5.
// ---------------------------------------------------------------------------

export type Chapter = {
  id: number;
  name: string;
  classLevel: "11" | "12";
  /** Chapter id that must be cleared before this one unlocks (null = always). */
  unlockedBy: number | null;
};

// Maps a reaction-type color name (as seeded) to its CSS variable, for borders
// and accents. Falls back to the brand primary for unknown names.
export const REACTION_COLOR_VARS: Record<string, string> = {
  blue: "var(--reaction-addition)",
  purple: "var(--reaction-substitution)",
  orange: "var(--reaction-elimination)",
  red: "var(--reaction-oxidation)",
  green: "var(--reaction-reduction)",
  teal: "var(--reaction-nucleophilic)",
  yellow: "var(--reaction-electrophilic)",
};

export function reactionColorVar(color: string | null | undefined): string {
  return (color && REACTION_COLOR_VARS[color]) || "var(--primary)";
}

export const CHAPTERS: Chapter[] = [
  { id: 1, name: "Hydrocarbons", classLevel: "11", unlockedBy: null },
  { id: 2, name: "Haloalkanes and Haloarenes", classLevel: "11", unlockedBy: 1 },
  { id: 3, name: "Alcohols, Phenols & Ethers", classLevel: "11", unlockedBy: 2 },
  { id: 4, name: "Aldehydes and Ketones", classLevel: "11", unlockedBy: 3 },
  { id: 5, name: "Carboxylic Acids", classLevel: "11", unlockedBy: 4 },
  { id: 6, name: "Amines", classLevel: "12", unlockedBy: 5 },
  { id: 7, name: "Biomolecules", classLevel: "12", unlockedBy: 6 },
  { id: 8, name: "Named Reactions Master Class", classLevel: "12", unlockedBy: 7 },
];
