"use client";

import { reactionColorVar } from "@/lib/constants";
import type { TreeNodeDTO } from "@/lib/tree";

// ---------------------------------------------------------------------------
// TreeNode (Sprint 6 §6.3). A single compound chip in the reaction tree. Border
// color = its reaction-type color. Clicking selects it, opening the mini-panel
// in ReactionTree. Positioned absolutely by its parent using col/row.
// ---------------------------------------------------------------------------

export const NODE_W = 132;
export const NODE_H = 44;
export const COL_GAP = 76;
export const ROW_GAP = 22;

/** Pixel position of a node's top-left from its col/row grid coordinates. */
export function nodePos(node: { col: number; row: number }) {
  return {
    x: node.col * (NODE_W + COL_GAP),
    y: node.row * (NODE_H + ROW_GAP),
  };
}

export function TreeNode({
  node,
  selected,
  onSelect,
}: {
  node: TreeNodeDTO;
  selected: boolean;
  onSelect: (node: TreeNodeDTO) => void;
}) {
  const { x, y } = nodePos(node);
  const color = reactionColorVar(node.color);

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      aria-pressed={selected}
      className="absolute flex items-center justify-center rounded-xl border-2 bg-card px-3 text-center text-sm font-semibold shadow-sm transition-transform hover:scale-105"
      style={{
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
        borderColor: color,
        boxShadow: selected
          ? `0 0 0 3px color-mix(in srgb, ${color} 40%, transparent)`
          : undefined,
      }}
    >
      {node.compoundName}
    </button>
  );
}
