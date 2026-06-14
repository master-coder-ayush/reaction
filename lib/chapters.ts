import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { badges, userBadges } from "@/db/schema";
import { CHAPTERS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Chapter gating (Sprint 5 §5.2). A logged-in user unlocks a chapter once they
// hold the *previous* chapter's boss-clear badge. Chapter 1 (Hydrocarbons) is
// always unlocked. Guests are never gated (they can't persist progress anyway),
// so callers pass `userId = null` and treat everything as unlocked.
//
// Boss-clear badges are the rows with `requirement_type = 'boss_cleared'`, keyed
// by `requirement_value = chapter id` (see scripts/seed-sprint5.ts). We resolve
// chapter → badge once here so both the gate check and the boss-award path agree.
// ---------------------------------------------------------------------------

/** Map of chapter id → its boss-clear badge id (from the badges table). */
export async function bossBadgeByChapter(): Promise<Map<number, number>> {
  const rows = await db
    .select({ id: badges.id, chapter: badges.requirementValue })
    .from(badges)
    .where(eq(badges.requirementType, "boss_cleared"));
  return new Map(rows.map((r) => [r.chapter, r.id]));
}

/** Chapters whose boss the user has cleared (set of chapter ids). */
export async function clearedChapters(userId: number): Promise<Set<number>> {
  const byChapter = await bossBadgeByChapter();
  if (byChapter.size === 0) return new Set();

  const badgeIds = Array.from(byChapter.values());
  const held = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(
      and(
        eq(userBadges.userId, userId),
        inArray(userBadges.badgeId, badgeIds)
      )
    );
  const heldSet = new Set(held.map((h) => h.badgeId));

  const cleared = new Set<number>();
  for (const [chapter, badgeId] of byChapter) {
    if (heldSet.has(badgeId)) cleared.add(chapter);
  }
  return cleared;
}

/** All chapters are unlocked for every user — no chapter gating. */
export async function unlockedChapters(_userId: number): Promise<Set<number>> {
  return new Set(CHAPTERS.map((c) => c.id));
}

/** All chapters are always accessible — no gating for any user. */
export async function isChapterUnlocked(
  _userId: number | null,
  _chapterId: number
): Promise<boolean> {
  return true;
}
