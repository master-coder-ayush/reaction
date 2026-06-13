"use client";

import { motion } from "framer-motion";
import { reactionColorVar } from "@/lib/constants";
import type { PathwayStepDTO } from "@/lib/pathway";

// ---------------------------------------------------------------------------
// PathwayChain (Sprint 6 §6.1). Renders a completed/in-progress conversion as a
// horizontal chain of compound chips joined by reagent-labelled arrows:
//
//   Methane → (Cl₂, hv) → Chloromethane → (KOH aq) → Methanol
//
// `revealed` is how many steps (compounds) are currently shown — the session
// grows this as the student answers, animating each new arrow + compound in.
// ---------------------------------------------------------------------------

export function PathwayChain({
  steps,
  revealed,
  compact = false,
}: {
  steps: PathwayStepDTO[];
  /** Number of compounds shown (1 = just the start). Defaults to all. */
  revealed?: number;
  /** Tighter spacing/text for the cards page. */
  compact?: boolean;
}) {
  const show = revealed ?? steps.length;

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.slice(0, show).map((step, i) => (
        <div key={step.stepOrder} className="flex items-center gap-x-1">
          {i > 0 && (
            <motion.span
              className="mx-0.5 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span
                className={`whitespace-nowrap rounded-full px-1.5 py-0.5 font-medium ${
                  compact ? "text-[10px]" : "text-[11px]"
                }`}
                style={{
                  color: reactionColorVar(step.reactionTypeColor),
                  backgroundColor: `color-mix(in srgb, ${reactionColorVar(
                    step.reactionTypeColor
                  )} 14%, transparent)`,
                }}
              >
                {step.reagentUsed ?? "?"}
              </span>
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            </motion.span>
          )}
          <motion.span
            className={`rounded-lg border bg-card font-semibold shadow-sm ${
              compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
            style={{
              borderColor: `color-mix(in srgb, ${reactionColorVar(
                step.reactionTypeColor
              )} 50%, var(--border))`,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i > 0 ? 0.12 : 0 }}
          >
            {step.compoundName}
          </motion.span>
        </div>
      ))}
    </div>
  );
}
