"use client";

import { useEffect, useRef, useState } from "react";

// Boss countdown timer (Sprint 5 §5.1). Counts down from `seconds`; calls
// `onExpire` exactly once when it hits 0 so the session can auto-submit. Turns
// red/pulsing in the final minute. Pure presentational + a single interval.

export function BossTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);
  // Keep the latest onExpire without restarting the interval each render.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpireRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const urgent = remaining <= 60;

  return (
    <span
      className={
        "rounded-lg px-2.5 py-1 font-mono text-sm font-bold tabular-nums " +
        (urgent
          ? "animate-pulse bg-destructive/15 text-destructive"
          : "bg-muted text-foreground")
      }
      aria-label={`Time remaining ${mm}:${ss}`}
    >
      ⏱ {mm}:{ss}
    </span>
  );
}
