import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, reactions, treeEdges, treeNodes } from "@/db/schema";

// ---------------------------------------------------------------------------
// Visual Reaction Tree data (Sprint 6 §6.3). Each chapter (category) has a set
// of nodes (compounds) and edges (reagent-labelled, reaction-type coloured). The
// tree is rendered as a flowchart on /learn/[chapter]; clicking a node lists the
// reactions starting from that compound with a "Practice this" link to Module 1.
// Public — guests read trees without auth.
// ---------------------------------------------------------------------------

export type TreeNodeDTO = {
  id: number;
  nodeKey: string;
  compoundName: string;
  color: string | null;
  col: number;
  row: number;
};

export type TreeEdgeDTO = {
  id: number;
  fromKey: string;
  toKey: string;
  reagentLabel: string;
  color: string | null;
};

export type ReactionLinkDTO = {
  id: number;
  name: string;
};

export type TreeDTO = {
  chapterId: number;
  categoryId: number | null;
  categoryName: string | null;
  nodes: TreeNodeDTO[];
  edges: TreeEdgeDTO[];
  // Reactions in this chapter, for the node mini-panel "Practice this reaction"
  // links. Matched to a node loosely by name containment on the client.
  reactions: ReactionLinkDTO[];
};

/** Load the reaction tree for a chapter (category order_index). */
export async function loadTree(chapterId: number): Promise<TreeDTO> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapterId))
    .limit(1);

  if (!category) {
    return {
      chapterId,
      categoryId: null,
      categoryName: null,
      nodes: [],
      edges: [],
      reactions: [],
    };
  }

  const [nodeRows, edgeRows, reactionRows] = await Promise.all([
    db
      .select({
        id: treeNodes.id,
        nodeKey: treeNodes.nodeKey,
        compoundName: treeNodes.compoundName,
        color: treeNodes.color,
        col: treeNodes.col,
        row: treeNodes.row,
      })
      .from(treeNodes)
      .where(eq(treeNodes.categoryId, category.id))
      .orderBy(asc(treeNodes.col), asc(treeNodes.row)),
    db
      .select({
        id: treeEdges.id,
        fromKey: treeEdges.fromKey,
        toKey: treeEdges.toKey,
        reagentLabel: treeEdges.reagentLabel,
        color: treeEdges.color,
      })
      .from(treeEdges)
      .where(eq(treeEdges.categoryId, category.id)),
    db
      .select({ id: reactions.id, name: reactions.name })
      .from(reactions)
      .where(eq(reactions.categoryId, category.id)),
  ]);

  return {
    chapterId,
    categoryId: category.id,
    categoryName: category.name,
    nodes: nodeRows,
    edges: edgeRows,
    reactions: reactionRows,
  };
}
