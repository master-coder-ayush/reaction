"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { reactionColorVar } from "@/lib/constants";
import type { ReactionCardDTO } from "@/lib/cards";

// ---------------------------------------------------------------------------
// ReactionCard (Sprint 7 §7.4). One collectible card. Unlocked cards show in
// full color with the reaction face (name, difficulty, R→reagent→P, type-color
// border, unlock date). For logged-in users, cards not yet mastered show as a
// dark silhouette — collection *progress*, never an access gate (all practice
// stays open). Guests aren't gated at all: they see every card in full color
// with a "Sign up to keep" watermark (PLAN.md guest access — open by default).
// `flipIn` plays a brief card-flip when a card is freshly unlocked mid-session.
// ---------------------------------------------------------------------------

function stars(difficulty: number): string {
  const n = Math.min(3, Math.max(1, difficulty));
  return "⭐".repeat(n);
}

export function ReactionCard({
  card,
  isGuest,
  flipIn = false,
}: {
  card: ReactionCardDTO;
  isGuest: boolean;
  flipIn?: boolean;
}) {
  const [flipped, setFlipped] = useState(!flipIn);

  const color = reactionColorVar(card.typeColor);

  // Guests are never gated — they always see the full card face (with a sign-up
  // watermark). Only logged-in users see the silhouette for not-yet-collected
  // cards, as collection progress.
  if (!card.unlocked && !isGuest) {
    return (
      <div className="flex aspect-3/4 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 p-4 text-center">
        <span className="text-3xl font-extrabold text-muted-foreground/50">?</span>
        <p className="mt-2 text-xs font-bold text-muted-foreground/70">
          {card.chapterName}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/50">
          Master this reaction to unlock
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="relative aspect-3/4"
      initial={flipIn ? { rotateY: 180 } : false}
      animate={{ rotateY: flipped ? 0 : 180 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => !flipped && setFlipped(true)}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="flex h-full flex-col rounded-2xl border-2 bg-card p-4 shadow-soft"
        style={{ borderColor: color, backfaceVisibility: "hidden" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              color,
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
            }}
          >
            {card.typeName}
          </span>
          <span className="text-xs">{stars(card.difficulty)}</span>
        </div>

        <h3 className="mt-2 text-sm font-extrabold leading-tight">{card.name}</h3>

        {(card.reactant || card.product) && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {card.reactant ?? "?"}{" "}
            {card.reagent ? `—[${card.reagent}]→` : "→"} {card.product ?? "?"}
          </p>
        )}

        <div className="mt-auto pt-3">
          {isGuest ? (
            <p className="text-[10px] font-bold text-pink-border">
              Sign up to keep this card
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Unlocked{" "}
              {card.unlockedAt
                ? new Date(card.unlockedAt).toLocaleDateString()
                : ""}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
