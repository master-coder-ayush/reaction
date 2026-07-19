import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyChallenges, reactions, reactionTypes } from "@/db/schema";
import { todayString, type DateString } from "@/lib/streak";

// ---------------------------------------------------------------------------
// Reaction of the Day resolution.
//
// A curated row in `dailyChallenges` for a given date always wins. When none
// exists, we fall back to a *deterministic* pick from the reaction catalogue so
// that every calendar day has a Reaction of the Day — no pre-seeding window to
// run out of, and the same date always resolves to the same reaction for every
// request/user.
// ---------------------------------------------------------------------------

export type ResolvedReaction = {
  reactionId: number;
  name: string;
  questionText: string;
  equationText: string | null;
  difficulty: number;
  classLevel: number;
  reactionTypeName: string;
  reactionTypeColor: string | null;
};

const REACTION_COLUMNS = {
  reactionId: reactions.id,
  name: reactions.name,
  questionText: reactions.questionText,
  equationText: reactions.equationText,
  difficulty: reactions.difficulty,
  classLevel: reactions.classLevel,
  reactionTypeName: reactionTypes.name,
  reactionTypeColor: reactionTypes.color,
} as const;

/** Stable non-negative hash of a `YYYY-MM-DD` date string. */
function dateHash(date: DateString): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = (h * 31 + date.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Resolve the Reaction of the Day for `date` (default: today). Prefers a
 * curated `dailyChallenges` row; otherwise deterministically derives one from
 * the reaction catalogue. Returns null only when there are no reactions at all.
 */
export async function resolveDailyReaction(
  date: DateString = todayString()
): Promise<ResolvedReaction | null> {
  const [curated] = await db
    .select(REACTION_COLUMNS)
    .from(dailyChallenges)
    .innerJoin(reactions, eq(dailyChallenges.reactionId, reactions.id))
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(dailyChallenges.challengeDate, date))
    .limit(1);
  if (curated) return curated;

  // Deterministic fallback: order the catalogue and index into it by date.
  const catalogue = await db
    .select(REACTION_COLUMNS)
    .from(reactions)
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .orderBy(asc(reactions.id));
  if (catalogue.length === 0) return null;

  return catalogue[dateHash(date) % catalogue.length];
}
