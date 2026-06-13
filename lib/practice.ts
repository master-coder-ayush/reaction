import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  reactions,
  reactionOptions,
  reactionTypes,
} from "@/db/schema";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";

// Server-side loader for Module 1 reactions. Mirrors GET /api/reactions but runs
// in the page (RSC) so the first question renders without a client round-trip.
// `chapter` is a category order_index (the chapter id used across the UI).

export async function loadChapterReactions(
  chapter: number
): Promise<{ categoryName: string | null; reactions: ReactionDTO[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);

  if (!category) return { categoryName: null, reactions: [] };

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
    })
    .from(reactions)
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(reactions.categoryId, category.id));

  if (reactionRows.length === 0) {
    return { categoryName: category.name, reactions: [] };
  }

  const optionRows = await db
    .select()
    .from(reactionOptions);

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

  const dto: ReactionDTO[] = reactionRows
    .map((r) => ({ ...r, options: optionsByReaction.get(r.id) ?? [] }))
    .filter((r) => r.options.length > 0);

  return { categoryName: category.name, reactions: dto };
}

// ---------------------------------------------------------------------------
// Session selection (Sprint 3 §3.1): draw up to N questions, weighted toward
// reactions the user has answered fewer times. Pure + testable; the page passes
// per-reaction attempt counts (empty for guests → uniform random).
// ---------------------------------------------------------------------------

export const SESSION_SIZE = 5;

export function pickSession<T extends { id: number }>(
  pool: T[],
  attemptsById: Record<number, number>,
  size = SESSION_SIZE,
  rng: () => number = Math.random
): T[] {
  const remaining = [...pool];
  const chosen: T[] = [];
  const target = Math.min(size, remaining.length);

  while (chosen.length < target && remaining.length > 0) {
    // Weight = 1 / (attempts + 1): fewer past attempts → higher chance.
    const weights = remaining.map((r) => 1 / ((attemptsById[r.id] ?? 0) + 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      roll -= weights[idx];
      if (roll <= 0) break;
    }
    if (idx >= remaining.length) idx = remaining.length - 1;
    chosen.push(remaining.splice(idx, 1)[0]);
  }

  return chosen;
}
