"use client";

// Floating "+N XP" animation shown on a correct answer (Sprint 3 §3.1). Render
// conditionally; it floats up and fades via the `xp-float` keyframes in
// globals.css. Remount with a changing `key` to replay.

import { Sparkles } from "lucide-react";

export function XPAnimation({ amount }: { amount: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2"
    >
      <span className="xp-float inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-sm font-extrabold text-primary-foreground shadow-soft-lg">
        <Sparkles className="h-3.5 w-3.5" />+{amount} XP
      </span>
    </div>
  );
}
