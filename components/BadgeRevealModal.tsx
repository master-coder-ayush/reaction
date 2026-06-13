"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reactionColorVar } from "@/lib/constants";
import type { AwardedBadge } from "@/lib/badges";

// ---------------------------------------------------------------------------
// Badge reveal modal (Sprint 4 §4.3). Mounted once near the app root. Listens
// for the global `badge-earned` CustomEvent (fired by lib/badge-client) and
// plays an animated reveal — like the Journey 4 boss results. Multiple badges
// earned at once are queued and shown one after another.
// ---------------------------------------------------------------------------

export function BadgeRevealModal() {
  const [queue, setQueue] = useState<AwardedBadge[]>([]);

  useEffect(() => {
    const onEarned = (e: Event) => {
      const detail = (e as CustomEvent<{ badge?: AwardedBadge }>).detail;
      if (detail?.badge) setQueue((q) => [...q, detail.badge!]);
    };
    window.addEventListener("badge-earned", onEarned);
    return () => window.removeEventListener("badge-earned", onEarned);
  }, []);

  const current = queue[0] ?? null;

  function dismiss() {
    setQueue((q) => q.slice(1));
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Badge earned!
            </p>

            <motion.div
              className="mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-full text-6xl shadow-inner"
              style={{
                backgroundColor: `color-mix(in srgb, ${reactionColorVar(
                  current.color
                )} 18%, transparent)`,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${reactionColorVar(
                  current.color
                )} 40%, transparent)`,
              }}
              initial={{ rotate: -12, scale: 0.5 }}
              animate={{ rotate: [-12, 8, 0], scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <span aria-hidden>{current.icon ?? "🏅"}</span>
            </motion.div>

            <h2 className="mt-6 text-xl font-bold tracking-tight">
              {current.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {current.description}
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              {queue.length > 1 ? "Next badge →" : "Awesome!"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
