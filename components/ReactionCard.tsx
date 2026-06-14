"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, FlaskConical, Lightbulb, Zap } from "lucide-react";
import { reactionColorVar } from "@/lib/constants";
import type { ReactionCardDTO } from "@/lib/cards";

function Stars({ difficulty }: { difficulty: number }) {
  const n = Math.min(3, Math.max(1, difficulty));
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden />
      ))}
    </span>
  );
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

  if (!card.unlocked && !isGuest) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-4 text-center" style={{ backgroundColor: `#ffbfdc` }}>
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
      className="relative"
      initial={flipIn ? { rotateY: 180 } : false}
      animate={{ rotateY: flipped ? 0 : 180 }}
      transition={{ duration: 0.6 }}
      onAnimationComplete={() => !flipped && setFlipped(true)}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="flex h-full flex-col gap-2 rounded-2xl border-2 bg-card p-3 shadow-soft overflow-hidden"
        style={{ borderColor: color, backfaceVisibility: "hidden" }}
      >
        {/* Header: type badge + stars */}
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
          <Stars difficulty={card.difficulty} />
        </div>

        {/* Reaction name */}
        <h3 className="text-sm font-extrabold leading-tight">{card.name}</h3>

        {/* Equation */}
        {card.equationText && (
          <div
            className="rounded-lg px-2 py-1.5"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)` }}
          >
            <p className="font-mono text-[11px] leading-snug break-all" style={{ color }}>
              {card.equationText}
            </p>
          </div>
        )}

        {/* Why it works */}
        {card.whyText && (
          <div className="flex gap-1.5">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-yellow-500" />
            <p className="text-[10px] leading-snug text-muted-foreground line-clamp-3">
              {card.whyText}
            </p>
          </div>
        )}

        {/* Real-life use */}
        {card.realLifeUse && (
          <div className="flex gap-1.5">
            <Zap className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
            <p className="text-[10px] leading-snug text-muted-foreground line-clamp-3">
              {card.realLifeUse}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground/60">{card.chapterName}</span>
          {isGuest ? (
            <p className="text-[10px] font-bold text-pink-border">Sign up to keep</p>
          ) : (
            <p className="text-[10px] text-muted-foreground/60">
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
