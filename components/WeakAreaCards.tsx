"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

// Weak-area quick-practice cards (Sprint 5 §5.1, Journey 11). On a boss fail we
// surface up to 3 reactions the student got wrong, each with a shortcut into the
// relevant practice module so they can drill it before retrying.

export type WeakArea = {
  reactionId: number;
  name: string;
  why: string | null;
  /** Which module to practise this in (2 = name-reaction, 1 = build). */
  module: 1 | 2;
};

export function WeakAreaCards({
  chapter,
  areas,
}: {
  chapter: number;
  areas: WeakArea[];
}) {
  if (areas.length === 0) return null;

  return (
    <div className="mt-6 text-left">
      <h3 className="flex items-center gap-1.5 text-sm font-extrabold tracking-tight">
        <Target className="h-4 w-4 text-warn" aria-hidden />
        Brush up on these
      </h3>
      <div className="mt-2 space-y-2.5">
        {areas.slice(0, 3).map((a) => (
          <Link
            key={a.reactionId}
            href={`/practice/${chapter}/module-${a.module}`}
            className="group block rounded-xl border border-border bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-warn/50 hover:shadow-soft-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{a.name}</span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-warn-border">
                Practice
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </div>
            {a.why && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {a.why}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
