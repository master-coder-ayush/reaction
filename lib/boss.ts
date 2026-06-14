import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  badges,
  bossAttempts,
  categories,
  reactions,
  reactionOptions,
  reactionTypes,
  userBadges,
} from "@/db/schema";
import { bossBadgeByChapter } from "@/lib/chapters";
import { todayString } from "@/lib/streak";
import type { AwardedBadge } from "@/lib/badges";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";

// ---------------------------------------------------------------------------
// Boss level (Sprint 5 §5.1). A boss draws 20 questions from *all* modules in a
// chapter — a mix of Module 1 "build the reaction" (reagent/product/reactant
// options) and Module 2 "name the reaction" (name options). The client walks
// them under a 10-minute timer with no hints; passing (≥16/20) awards the
// chapter's boss badge + 200 XP and unlocks the next chapter.
// ---------------------------------------------------------------------------

export {
  BOSS_QUESTION_COUNT,
  BOSS_PASS_THRESHOLD,
  BOSS_TIME_SECONDS,
  BOSS_DAILY_ATTEMPT_LIMIT,
  BOSS_XP_AWARD,
  type BossQuestion,
} from "@/lib/boss-client";
import { BOSS_QUESTION_COUNT, BOSS_PASS_THRESHOLD, BOSS_TIME_SECONDS, type BossQuestion } from "@/lib/boss-client";

export async function loadBossQuestions(
  chapter: number
): Promise<{ categoryName: string | null; questions: BossQuestion[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);

  if (!category) return { categoryName: null, questions: [] };

  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
      questionText: reactions.questionText,
      equationText: reactions.equationText,
      difficulty: reactions.difficulty,
      reactionTypeName: reactionTypes.name,
      reactionTypeColor: reactionTypes.color,
      hintWrongReagent: reactions.hintWrongReagent,
      hintWrongProduct: reactions.hintWrongProduct,
      hintWrongReactant: reactions.hintWrongReactant,
      storyText: reactions.storyText,
      whyText: reactions.whyText,
      isNameReaction: reactions.isNameReaction,
    })
    .from(reactions)
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(reactions.categoryId, category.id));

  if (reactionRows.length === 0) {
    return { categoryName: category.name, questions: [] };
  }

  const optionRows = await db
    .select()
    .from(reactionOptions)
    .where(
      inArray(
        reactionOptions.reactionId,
        reactionRows.map((r) => r.id)
      )
    )
    .orderBy(asc(reactionOptions.displayOrder));

  const optionsByReaction = new Map<number, ReactionOptionDTO[]>();
  for (const o of optionRows) {
    const list = optionsByReaction.get(o.reactionId) ?? [];
    list.push({
      id: o.id,
      optionType: o.optionType,
      text: o.text,
      isCorrect: o.isCorrect,
      displayOrder: o.displayOrder,
    });
    optionsByReaction.set(o.reactionId, list);
  }

  // Build one or two questions per reaction: a "name" question if it has name
  // options, plus a "build" question if it has any non-name options. This gives
  // the boss the Module 1 + Module 2 mix the sprint calls for.
  const pool: BossQuestion[] = [];
  for (const r of reactionRows) {
    const opts = optionsByReaction.get(r.id) ?? [];
    if (opts.length === 0) continue;
    const { isNameReaction: _isName, ...rest } = r;
    const base = { ...rest, options: opts };
    if (opts.some((o) => o.optionType === "name")) {
      pool.push({ ...base, mode: "name" });
    }
    if (opts.some((o) => o.optionType !== "name")) {
      pool.push({ ...base, mode: "build" });
    }
  }

  const questions = shuffle(pool).slice(0, BOSS_QUESTION_COUNT);
  return { categoryName: category.name, questions };
}

/** Fisher–Yates shuffle (server-side selection, so randomness is fine here). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Attempt tracking (Sprint 5 §5.1) — per user, per chapter, per calendar day.
// ---------------------------------------------------------------------------

/** How many boss attempts the user has spent on this chapter today. */
export async function attemptsToday(
  userId: number,
  chapter: number,
  today: string = todayString()
): Promise<number> {
  const [row] = await db
    .select({ attempts: bossAttempts.attempts })
    .from(bossAttempts)
    .where(
      and(
        eq(bossAttempts.userId, userId),
        eq(bossAttempts.chapter, chapter),
        eq(bossAttempts.attemptDate, today)
      )
    )
    .limit(1);
  return row?.attempts ?? 0;
}

/** Record one attempt; returns the new attempt count for today. */
export async function recordAttempt(
  userId: number,
  chapter: number,
  today: string = todayString()
): Promise<number> {
  const [row] = await db
    .insert(bossAttempts)
    .values({ userId, chapter, attemptDate: today, attempts: 1 })
    .onConflictDoUpdate({
      target: [bossAttempts.userId, bossAttempts.chapter, bossAttempts.attemptDate],
      set: { attempts: sql`${bossAttempts.attempts} + 1` },
    })
    .returning({ attempts: bossAttempts.attempts });
  return row?.attempts ?? 1;
}

// ---------------------------------------------------------------------------
// Boss badge awarding (Sprint 5 §5.3). Awarded directly here (not via the
// generic requirement engine) since the boss route is the authority on which
// chapter was cleared and whether it was a perfect run.
// ---------------------------------------------------------------------------

/**
 * Award the chapter's boss-clear badge (and the Perfect Boss badge on 20/20).
 * Idempotent — onConflictDoNothing guards re-clears. Returns the badges newly
 * earned by *this* call, for the reveal animation.
 */
export async function awardBossBadges(
  userId: number,
  chapter: number,
  perfect: boolean
): Promise<AwardedBadge[]> {
  const byChapter = await bossBadgeByChapter();
  const ids: number[] = [];
  const chapterBadge = byChapter.get(chapter);
  if (chapterBadge != null) ids.push(chapterBadge);

  if (perfect) {
    const [perfectBadge] = await db
      .select({ id: badges.id })
      .from(badges)
      .where(eq(badges.requirementType, "perfect_boss"))
      .limit(1);
    if (perfectBadge) ids.push(perfectBadge.id);
  }

  return awardBadgeIds(userId, ids);
}

/** Insert the given badge ids for the user, returning those newly earned. */
export async function awardBadgeIds(
  userId: number,
  badgeIds: number[]
): Promise<AwardedBadge[]> {
  if (badgeIds.length === 0) return [];

  const awarded: AwardedBadge[] = [];
  for (const badgeId of badgeIds) {
    const inserted = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .onConflictDoNothing({ target: [userBadges.userId, userBadges.badgeId] })
      .returning({ badgeId: userBadges.badgeId });
    if (inserted.length === 0) continue;

    const [b] = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        icon: badges.icon,
        color: badges.color,
      })
      .from(badges)
      .where(eq(badges.id, badgeId))
      .limit(1);
    if (b) awarded.push(b);
  }
  return awarded;
}
