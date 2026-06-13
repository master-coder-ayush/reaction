"use client";

import Link from "next/link";

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
      <h3 className="text-sm font-semibold">Brush up on these</h3>
      <div className="mt-2 space-y-2.5">
        {areas.slice(0, 3).map((a) => (
          <Link
            key={a.reactionId}
            href={`/practice/${chapter}/module-${a.module}`}
            className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{a.name}</span>
              <span className="shrink-0 text-xs font-medium text-primary">
                Practice →
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
