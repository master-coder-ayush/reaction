import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  pathwayCards,
  pathwaySteps,
  reactionPathways,
  reactionTypes,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Pathway Challenge data (Sprint 6 §6.1). A pathway is a multi-step conversion
// (Start → … → End); each step is a compound reached via a reagent. The session
// asks the student to pick the next compound at each step. Reused by the Module
// 4 page (server-loaded) and the /cards page.
// ---------------------------------------------------------------------------

export type {
  PathwayStepDTO,
  PathwayDTO,
} from "@/lib/pathway-client";
export { PATHWAY_STEP_XP, PATHWAY_COMPLETE_XP } from "@/lib/pathway-client";
import type { PathwayStepDTO, PathwayDTO } from "@/lib/pathway-client";

/** Group raw step rows into a per-pathway ordered step list. */
function buildSteps(
  rows: {
    pathwayId: number;
    stepOrder: number;
    compoundName: string;
    reagentUsed: string | null;
    color: string | null;
  }[]
): Map<number, PathwayStepDTO[]> {
  const byPathway = new Map<number, PathwayStepDTO[]>();
  for (const r of rows) {
    const list = byPathway.get(r.pathwayId) ?? [];
    list.push({
      stepOrder: r.stepOrder,
      compoundName: r.compoundName,
      reagentUsed: r.reagentUsed,
      reactionTypeColor: r.color,
    });
    byPathway.set(r.pathwayId, list);
  }
  for (const list of byPathway.values()) {
    list.sort((a, b) => a.stepOrder - b.stepOrder);
  }
  return byPathway;
}

function toDTO(
  p: { id: number; name: string; description: string | null },
  steps: PathwayStepDTO[]
): PathwayDTO {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    steps,
    startCompound: steps[0]?.compoundName ?? "",
    endCompound: steps[steps.length - 1]?.compoundName ?? "",
  };
}

/**
 * Load all pathways for a chapter (category order_index), each with its ordered
 * steps. Only pathways that have at least two steps (a start + an end) are
 * returned, so the challenge always has something to play.
 */
export async function loadChapterPathways(
  chapterId: number
): Promise<{ categoryName: string | null; pathways: PathwayDTO[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapterId))
    .limit(1);

  if (!category) return { categoryName: null, pathways: [] };

  const pathwayRows = await db
    .select({
      id: reactionPathways.id,
      name: reactionPathways.name,
      description: reactionPathways.description,
    })
    .from(reactionPathways)
    .where(eq(reactionPathways.categoryId, category.id))
    .orderBy(asc(reactionPathways.id));

  if (pathwayRows.length === 0) {
    return { categoryName: category.name, pathways: [] };
  }

  const stepRows = await db
    .select({
      pathwayId: pathwaySteps.pathwayId,
      stepOrder: pathwaySteps.stepOrder,
      compoundName: pathwaySteps.compoundName,
      reagentUsed: pathwaySteps.reagentUsed,
      color: reactionTypes.color,
    })
    .from(pathwaySteps)
    .leftJoin(reactionTypes, eq(pathwaySteps.reactionTypeId, reactionTypes.id))
    .where(
      inArray(
        pathwaySteps.pathwayId,
        pathwayRows.map((p) => p.id)
      )
    );

  const stepsByPathway = buildSteps(stepRows);

  const pathways = pathwayRows
    .map((p) => toDTO(p, stepsByPathway.get(p.id) ?? []))
    .filter((p) => p.steps.length >= 2);

  return { categoryName: category.name, pathways };
}

/** Load a single pathway with its steps (used by /api/pathway/complete). */
export async function loadPathway(pathwayId: number): Promise<PathwayDTO | null> {
  const [p] = await db
    .select({
      id: reactionPathways.id,
      name: reactionPathways.name,
      description: reactionPathways.description,
    })
    .from(reactionPathways)
    .where(eq(reactionPathways.id, pathwayId))
    .limit(1);
  if (!p) return null;

  const stepRows = await db
    .select({
      pathwayId: pathwaySteps.pathwayId,
      stepOrder: pathwaySteps.stepOrder,
      compoundName: pathwaySteps.compoundName,
      reagentUsed: pathwaySteps.reagentUsed,
      color: reactionTypes.color,
    })
    .from(pathwaySteps)
    .leftJoin(reactionTypes, eq(pathwaySteps.reactionTypeId, reactionTypes.id))
    .where(eq(pathwaySteps.pathwayId, pathwayId));

  const steps = buildSteps(stepRows).get(pathwayId) ?? [];
  return toDTO(p, steps);
}

/** How many distinct pathways a user has completed (= pathway cards held). */
export async function countCompletedPathways(userId: number): Promise<number> {
  const rows = await db
    .select({ pathwayId: pathwayCards.pathwayId })
    .from(pathwayCards)
    .where(eq(pathwayCards.userId, userId));
  return rows.length;
}

/** Has the user already earned this pathway's card? */
export async function hasPathwayCard(
  userId: number,
  pathwayId: number
): Promise<boolean> {
  const [row] = await db
    .select({ pathwayId: pathwayCards.pathwayId })
    .from(pathwayCards)
    .where(
      and(
        eq(pathwayCards.userId, userId),
        eq(pathwayCards.pathwayId, pathwayId)
      )
    )
    .limit(1);
  return !!row;
}

/** Pathway cards collected by a user, newest first, with the pathway detail. */
export async function loadPathwayCards(userId: number): Promise<
  {
    pathway: PathwayDTO;
    unlockedAt: Date;
  }[]
> {
  const cardRows = await db
    .select({
      pathwayId: pathwayCards.pathwayId,
      unlockedAt: pathwayCards.unlockedAt,
    })
    .from(pathwayCards)
    .where(eq(pathwayCards.userId, userId));

  if (cardRows.length === 0) return [];

  const ids = cardRows.map((c) => c.pathwayId);
  const pathwayRows = await db
    .select({
      id: reactionPathways.id,
      name: reactionPathways.name,
      description: reactionPathways.description,
    })
    .from(reactionPathways)
    .where(inArray(reactionPathways.id, ids));

  const stepRows = await db
    .select({
      pathwayId: pathwaySteps.pathwayId,
      stepOrder: pathwaySteps.stepOrder,
      compoundName: pathwaySteps.compoundName,
      reagentUsed: pathwaySteps.reagentUsed,
      color: reactionTypes.color,
    })
    .from(pathwaySteps)
    .leftJoin(reactionTypes, eq(pathwaySteps.reactionTypeId, reactionTypes.id))
    .where(inArray(pathwaySteps.pathwayId, ids));

  const stepsByPathway = buildSteps(stepRows);
  const pathwayById = new Map(pathwayRows.map((p) => [p.id, p]));

  return cardRows
    .map((c) => {
      const p = pathwayById.get(c.pathwayId);
      if (!p) return null;
      return {
        pathway: toDTO(p, stepsByPathway.get(p.id) ?? []),
        unlockedAt: c.unlockedAt,
      };
    })
    .filter((x): x is { pathway: PathwayDTO; unlockedAt: Date } => x !== null)
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
}
