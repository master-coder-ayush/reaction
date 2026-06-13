"use client";

// TimerBar (Sprint 7 §7.2). A depleting bar showing remaining time as a fraction
// of the total. Turns amber then red as it runs low. Purely presentational —
// the parent owns the countdown.

export function TimerBar({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const color =
    pct > 50 ? "bg-primary" : pct > 20 ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="sticky top-14 z-30">
      <div className="flex items-center justify-between text-xs font-semibold tabular-nums text-muted-foreground">
        <span>Time left</span>
        <span>{Math.ceil(remaining)}s</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={"h-full rounded-full transition-[width] duration-200 " + color}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
