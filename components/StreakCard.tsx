"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, Flame, Snowflake } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl border border-info/40 bg-info-soft px-3 text-sm font-bold text-info-border transition-colors hover:bg-info-soft/70"
        >
          <Snowflake className="h-4 w-4" />
          Use a streak freeze
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-info/30 bg-info-soft/50 p-3">
          <p className="text-sm">
            Use one streak freeze to protect your {streakCurrent}-day streak
            today?
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              onClick={useFreeze}
              disabled={busy}
              variant="info"
              size="sm"
            >
              {busy ? "Freezing…" : "Confirm"}
            </Button>
            <Button
              type="button"
              onClick={() => setConfirming(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (frozen) {
    return (
      <Card accent="teal">
        <div className="flex items-center gap-3">
          <span className="icon-chip bg-info-soft text-info-border" aria-hidden>
            <Snowflake className="h-5 w-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold tracking-tight">
              Streak protected
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your {streakCurrent}-day streak is safe for today.{" "}
              {freezes} freeze{freezes === 1 ? "" : "s"} left.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (broken) {
    return (
      <Card accent="orange">
        <div className="flex items-center gap-3">
          <span
            className="icon-chip bg-destructive-soft text-destructive-border"
            aria-hidden
          >
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <div className="text-lg font-extrabold tracking-tight">
              Streak lost 😔
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {canFreeze
                ? `You missed a day — but you have ${freezes} streak freeze${
                    freezes === 1 ? "" : "s"
                  }. Use one to save your streak, or complete a reaction today.`
                : "You missed a day and your streak reset. Complete today's reaction to start a new one!"}
            </p>
          </div>
        </div>
        {canFreeze && freezeButton}
      </Card>
    );
  }

  return (
    <Card accent="orange">
      <div className="flex items-center gap-3">
        <span className="icon-chip bg-warn-soft text-warn-border" aria-hidden>
          <Flame className="h-5 w-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">
          {streakCurrent}-day streak
        </span>
      </div>
      {atRisk && !doneToday ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-warn-border">
          <AlarmClock className="h-4 w-4" />
          Your streak ends at midnight — complete a reaction to keep it!
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {doneToday
            ? "Nice — today's reaction is done. See you tomorrow!"
            : "Complete today's reaction to keep it alive!"}
        </p>
      )}
      {freezes > 0 && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-info-border">
          <Snowflake className="h-3.5 w-3.5" />
          {freezes} streak freeze{freezes === 1 ? "" : "s"} banked
        </p>
      )}
      {atRisk && !doneToday && freezeButton}
    </Card>
  );
}
