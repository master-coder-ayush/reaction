"use client";

import { useState } from "react";
import { Check, Sparkles, Star } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
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
      <div className="card-soft p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-muted-foreground">
          <Star className="h-4 w-4" aria-hidden />
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
      className="pulse-border rounded-2xl border-2 bg-card p-5 shadow-soft"
      style={
        {
          borderColor: accent,
          "--pulse-color": accent,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 text-sm font-extrabold tracking-tight"
          style={{ color: accent }}
        >
          <span
            className="icon-chip h-8 w-8"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            }}
            aria-hidden
          >
            <Star className="h-4 w-4 fill-current" />
          </span>
          Reaction of the Day
        </div>
        <div className="text-xs font-semibold tabular-nums text-muted-foreground">
          Next in <Countdown />
        </div>
      </div>

      <h3 className="mt-3 text-lg font-extrabold tracking-tight">
        {challenge.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {challenge.questionText}
      </p>
      {challenge.equationText && (
        <p className="mt-2 rounded-xl bg-muted px-3 py-2 font-mono text-sm">
          {challenge.equationText}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {challenge.reactionTypeName}
        </span>
        {!done && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary-border">
            <Sparkles className="h-3 w-3" />2× XP today — {bonusXp} XP
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}

      <Button
        type="button"
        onClick={handleComplete}
        disabled={done || busy}
        variant="primary"
        className="mt-4 w-full"
      >
        {done ? (
          <>
            <Check className="h-4 w-4" /> Completed today
          </>
        ) : busy ? (
          "Saving…"
        ) : (
          `Complete for ${bonusXp} XP`
        )}
      </Button>
    </div>
  );
}
