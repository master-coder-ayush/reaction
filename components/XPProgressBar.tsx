import { Card } from "@/components/ui/card";
import { levelInfo } from "@/lib/xp";

/**
 * XP progress bar (Sprint 2 §2.2). Shows current XP within the level band,
 * the level title, and the threshold to next level. Works for any XP total —
 * used on the logged-in dashboard.
 */
export function XPProgressBar({ xp }: { xp: number }) {
  const info = levelInfo(xp);
  const pct = Math.round(info.progress * 100);

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">
          Level {info.level} · {info.title}
        </span>
        <span className="text-xs text-muted-foreground">
          {info.nextLevelXp === null
            ? `${xp} XP · Max level`
            : `${xp} / ${info.nextLevelXp} XP to next level`}
        </span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {info.nextLevelXp !== null && info.xpForLevelSpan !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          {info.xpForLevelSpan - info.xpIntoLevel} XP to level {info.level + 1}
        </p>
      )}
    </Card>
  );
}
