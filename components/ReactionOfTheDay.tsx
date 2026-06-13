"use client";

import { useState } from "react";
import { Countdown } from "@/components/Countdown";
import { fireLevelUp } from "@/components/LevelUpToast";
import { reactionColorVar } from "@/lib/constants";
import { awardGuestXp } from "@/lib/guest";

export type DailyChallenge = {
  reactionId: number;
  name: string;
  questionText: string;
  equationText: string | null;
  difficulty: number;
  reactionTypeName: string;
  reactionTypeColor: string | null;
};

type Props = {
  challenge: DailyChallenge | null;
  /** Already completed today (logged-in users only). */
  completed?: boolean;
  /** Double-XP amount awarded on first correct answer. */
  bonusXp: number;
  isGuest: boolean;
};

/**
 * Reaction of the Day card (Sprint 2 §2.7). Highlighted with a pulsing,
 * reaction-type-colored border and a countdown to the next day's reaction.
 * First correct answer awards double XP — via the API for logged-in users,
 * via localStorage for guests (no bonus persisted).
 */
export function ReactionOfTheDay({
  challenge,
  completed = false,
  bonusXp,
  isGuest,
}: Props) {
  const [done, setDone] = useState(completed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!challenge) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold text-muted-foreground">
          Reaction of the Day
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          No reaction is set for today — check back soon.
        </p>
      </div>
    );
  }

  const accent = reactionColorVar(challenge.reactionTypeColor);

  async function handleComplete() {
    if (done || busy || !challenge) return;
    setBusy(true);
    setError(null);

    if (isGuest) {
      // Guests: local XP only, no double-XP persistence, no streak.
      const result = awardGuestXp(bonusXp, "reaction_of_the_day");
      setDone(true);
      setBusy(false);
      if (result.leveledUp) fireLevelUp(result.newLevelTitle);
      return;
    }

    try {
      const res = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionId: challenge.reactionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.alreadyCompleted) setDone(true);
        else setError(data.error ?? "Could not record your answer.");
        setBusy(false);
        return;
      }
      setDone(true);
      setBusy(false);
      if (data.leveledUp) fireLevelUp(data.newLevelTitle);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="pulse-border rounded-2xl border-2 bg-card p-5 shadow-sm"
      style={
        {
          borderColor: accent,
          "--pulse-color": accent,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold" style={{ color: accent }}>
          ⭐ Reaction of the Day
        </div>
        <div className="text-xs tabular-nums text-muted-foreground">
          Next in <Countdown />
        </div>
      </div>

      <h3 className="mt-2 text-lg font-semibold">{challenge.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {challenge.questionText}
      </p>
      {challenge.equationText && (
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 font-mono text-sm">
          {challenge.equationText}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: accent }}
        >
          {challenge.reactionTypeName}
        </span>
        {!done && (
          <span className="text-xs font-semibold text-success">
            2× XP today — {bonusXp} XP
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      <button
        type="button"
        onClick={handleComplete}
        disabled={done || busy}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {done
          ? "✓ Completed today"
          : busy
            ? "Saving…"
            : `Complete for ${bonusXp} XP`}
      </button>
    </div>
  );
}
