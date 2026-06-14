"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { NODE_H, NODE_W, TreeNode, nodePos } from "@/components/TreeNode";
import { reactionColorVar } from "@/lib/constants";
import type { TreeDTO, TreeNodeDTO } from "@/lib/tree";

// ---------------------------------------------------------------------------
// ReactionTree (Sprint 6 §6.3). Renders a chapter's compound tree as a custom
// SVG/CSS flowchart — nodes positioned by col/row, edges drawn as SVG paths with
// reagent labels coloured by reaction type. Horizontally scrollable on mobile.
// Clicking a node opens a mini-panel listing the reactions that start from that
// compound, each linking to Module 1 practice. Public — no auth needed.
// ---------------------------------------------------------------------------

export function ReactionTree({ tree }: { tree: TreeDTO }) {
  const [selected, setSelected] = useState<TreeNodeDTO | null>(null);

  const nodeByKey = useMemo(
    () => new Map(tree.nodes.map((n) => [n.nodeKey, n])),
    [tree.nodes]
  );

  // Canvas size from the furthest node.
  const { width, height } = useMemo(() => {
    let w = 0;
    let h = 0;
    for (const n of tree.nodes) {
      const { x, y } = nodePos(n);
      w = Math.max(w, x + NODE_W);
      h = Math.max(h, y + NODE_H);
    }
    return { width: w + 8, height: h + 8 };
  }, [tree.nodes]);

  // Reactions whose name mentions the selected compound — loose containment so a
  // node like "Alcohol" surfaces "… → Alcohol" reactions for practice.
  const nodeReactions = useMemo(() => {
    if (!selected) return [];
    const needle = selected.compoundName.toLowerCase();
    return tree.reactions.filter((r) => r.name.toLowerCase().includes(needle));
  }, [selected, tree.reactions]);

  if (tree.nodes.length === 0) {
    return (
      <div className="card-soft p-6 text-center text-sm text-muted-foreground">
        No reaction tree for this chapter yet.
      </div>
    );
  }

  return (
    <div className="card-soft p-4">
      <div className="overflow-x-auto pb-2">
        <div
          className="relative mx-auto"
          style={{ width, height, minWidth: width }}
        >
          {/* Edges (SVG layer behind nodes). */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            <defs>
              <marker
                id="tree-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground)" />
              </marker>
            </defs>
            {tree.edges.map((edge) => {
              const from = nodeByKey.get(edge.fromKey);
              const to = nodeByKey.get(edge.toKey);
              if (!from || !to) return null;
              const fp = nodePos(from);
              const tp = nodePos(to);
              // Exit right-center of `from`, enter left-center of `to`.
              const x1 = fp.x + NODE_W;
              const y1 = fp.y + NODE_H / 2;
              const x2 = tp.x;
              const y2 = tp.y + NODE_H / 2;
              const midX = (x1 + x2) / 2;
              const color = reactionColorVar(edge.color);
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    markerEnd="url(#tree-arrow)"
                    opacity={0.85}
                  />
                  <text
                    x={midX}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    fill={color}
                  >
                    {edge.reagentLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Nodes. */}
          {tree.nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selected={selected?.id === node.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </div>

      {/* Node mini-panel. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="mt-2 rounded-2xl border border-border bg-muted/40 p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold tracking-tight">{selected.compoundName}</h4>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {nodeReactions.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {nodeReactions.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 text-sm font-semibold"
                  >
                    <span>{r.name}</span>
                    <Link
                      href={`/practice/${tree.chapterId}/module-1`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-colors hover:brightness-105"
                    >
                      Practice <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No specific reactions tagged for {selected.compoundName} yet.{" "}
                <Link
                  href={`/practice/${tree.chapterId}/module-1`}
                  className="font-bold text-primary hover:underline"
                >
                  Practice this chapter →
                </Link>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Tap a compound to see its reactions · scroll sideways to explore
      </p>
    </div>
  );
}
