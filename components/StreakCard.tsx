"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export type StreakCardProps = {
  streakCurrent: number;
  streakFreezeCount: number;
  /** Whether the user has already completed a reaction today. */
  doneToday: boolean;
  /** Whether the streak has been broken (a day was missed). */
  broken: boolean;
  /** Whether a freeze is available to rescue a broken streak. */
  canFreeze: boolean;
  /** True when it's after 6 PM and today's reaction isn't done (Sprint 8 §8.7). */
  atRisk?: boolean;
};

/**
 * Dashboard streak card (Sprint 2 §2.2/§2.6, Sprint 8 §8.7). Logged-in only.
 * Renders healthy / "keep it alive" / "Streak lost 😔" states, an at-risk
 * warning after 6 PM, and a working "Use Streak Freeze" button (with a confirm)
 * that calls POST /api/streak/freeze.
 */
export function StreakCard({
  streakCurrent,
  streakFreezeCount,
  doneToday,
  broken,
  canFreeze,
  atRisk = false,
}: StreakCardProps) {
  const router = useRouter();
  const [freezes, setFreezes] = useState(streakFreezeCount);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [frozen, setFrozen] = useState(false);

  async function useFreeze() {
    setBusy(true);
    try {
      const res = await fetch("/api/streak/freeze", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFreezes(data.freezesRemaining ?? Math.max(0, freezes - 1));
        setFrozen(true);
        setConfirming(false);
        router.refresh();
      }
    } catch {
      /* non-fatal */
    } finally {
      setBusy(false);
    }
  }

  const freezeButton = freezes > 0 && !frozen && (
    <>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
        >
          ❄️ Use a streak freeze
        </button>
      ) : (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm">
            Use one streak freeze to protect your {streakCurrent}-day streak
            today?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={useFreeze}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Freezing…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (frozen) {
    return (
      <Card>
        <div className="text-lg font-semibold">❄️ Streak protected</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your {streakCurrent}-day streak is safe for today.{" "}
          {freezes} freeze{freezes === 1 ? "" : "s"} left.
        </p>
      </Card>
    );
  }

  if (broken) {
    return (
      <Card className="border-destructive/40">
        <div className="text-lg font-semibold">Streak lost 😔</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {canFreeze
            ? `You missed a day — but you have ${freezes} streak freeze${
                freezes === 1 ? "" : "s"
              }. Use one to save your streak, or complete a reaction today.`
            : "You missed a day and your streak reset. Complete today's reaction to start a new one!"}
        </p>
        {canFreeze && freezeButton}
      </Card>
    );
  }

  return (
    <Card className={atRisk ? "border-amber-400/60" : undefined}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">🔥</span>
        <span className="text-lg font-semibold">{streakCurrent}-day streak</span>
      </div>
      {atRisk && !doneToday ? (
        <p className="mt-1 text-sm font-medium text-amber-600">
          ⏰ Your streak ends at midnight — complete a reaction to keep it!
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          {doneToday
            ? "Nice — today's reaction is done. See you tomorrow!"
            : "Complete today's reaction to keep it alive!"}
        </p>
      )}
      {freezes > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          ❄️ {freezes} streak freeze{freezes === 1 ? "" : "s"} banked
        </p>
      )}
      {atRisk && !doneToday && freezeButton}
    </Card>
  );
}
