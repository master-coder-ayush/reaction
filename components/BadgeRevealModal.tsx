"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { reactionColorVar } from "@/lib/constants";
import { Button } from "@/components/ui/button";
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
            className="card-soft relative w-full max-w-sm overflow-hidden rounded-2xl p-0 text-center shadow-soft-lg"
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="gradient-purple px-8 pb-6 pt-7 text-white">
              <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="h-4 w-4" aria-hidden />
                Badge earned!
              </p>
            </div>

            <div className="px-8 pb-8">
              <motion.div
                className="mx-auto -mt-12 flex h-28 w-28 items-center justify-center rounded-full bg-card text-6xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${reactionColorVar(
                    current.color
                  )} 18%, white)`,
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

              <h2 className="mt-6 text-xl font-extrabold tracking-tight">
                {current.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {current.description}
              </p>

              <Button
                type="button"
                onClick={dismiss}
                variant="accent"
                className="mt-7 w-full"
              >
                {queue.length > 1 ? "Next badge →" : "Awesome!"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
