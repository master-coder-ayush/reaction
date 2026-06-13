"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ReferenceList } from "@/components/ReferenceList";
import type { ReferenceSection } from "@/lib/reference";

// ReferenceDrawer (Sprint 8 §8.4). A book-icon button (top corner of a question
// card) that opens a side drawer with the reagent reference for the current
// chapter — without unmounting or pausing the question behind it. Reference
// sections are fetched lazily from /api/reference/chapter/[id] on first open.
//
// Usage is intentionally not penalised (no XP deduction); we keep it purely a
// study aid, so opening it has no side effect on the session.

export function ReferenceDrawer({ chapterId }: { chapterId: number }) {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<ReferenceSection[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || sections != null) return;
    let cancelled = false;
    // Lazy fetch on first open — a genuine external-data effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/reference/chapter/${chapterId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSections(data.sections ?? []);
      })
      .catch(() => {
        if (!cancelled) setSections([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, sections, chapterId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open reagent reference"
        title="Reagent reference"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
      >
        📖
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-base font-bold">📚 Reagent Reference</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close reference"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Close ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {loading || sections == null ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 animate-pulse rounded-xl bg-muted"
                      />
                    ))}
                  </div>
                ) : (
                  <ReferenceList sections={sections} searchable={false} />
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
