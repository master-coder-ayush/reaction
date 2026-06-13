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
