"use client";

import { useEffect, useState } from "react";

/** Milliseconds remaining until the next local midnight. */
function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function format(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Client-side countdown to the next day's reaction (local midnight). Renders
 * `23:xx:xx` style. Starts blank on the server to avoid a hydration mismatch,
 * then ticks every second once mounted.
 */
export function Countdown({ className }: { className?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(msUntilMidnight());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {remaining === null ? "—:—:—" : format(remaining)}
    </span>
  );
}
