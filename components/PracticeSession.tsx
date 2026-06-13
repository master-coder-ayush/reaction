"use client";

import { useMemo, useState } from "react";
import { QuestionCard, type AnsweredResult } from "@/components/QuestionCard";
import {
  SessionSummary,
  type SessionReactionResult,
} from "@/components/SessionSummary";
import { fireLevelUp } from "@/components/LevelUpToast";
import { awardGuestXp, recordGuestResult } from "@/lib/guest";
import { pickSession, SESSION_SIZE } from "@/lib/practice";
import { xpForDifficulty } from "@/lib/xp";
import type { ReactionDTO } from "@/app/api/reactions/route";

type Props = {
  chapterId: number;
  categoryName: string | null;
  reactions: ReactionDTO[];
  isGuest: boolean;
  /** Per-reaction prior attempt counts (logged-in only) for weighted selection. */
  attemptsById: Record<number, number>;
  /** Reactions already mastered (≥3 correct) so we can flag fresh unlocks. */
  masteredIds: number[];
};

type Phase = "playing" | "summary";

/**
 * Client orchestrator for a Module 1 practice session (Sprint 3 §3.1–3.5).
 * Draws 5 weighted questions, walks through them one card at a time, awards XP
 * (API for logged-in, localStorage for guests), records progress, and shows the
 * session summary. Guests never hit an auth wall.
 */
export function PracticeSession({
  chapterId,
  categoryName,
  reactions,
  isGuest,
  attemptsById,
  masteredIds,
}: Props) {
  // Track local correct-count per reaction across this session so we can detect
  // the 3rd correct → "card unlocked" for guests (and as a UI hint for users).
  const [sessionKey, setSessionKey] = useState(0);

  const session = useMemo(
    () => pickSession(reactions, attemptsById, SESSION_SIZE),
    // Re-pick when the user hits "Try Again".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactions, sessionKey]
  );

  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [results, setResults] = useState<SessionReactionResult[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  // Running correct counts (prior DB count for logged-in users + this session).
  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);

  // Empty chapter / no reactions edge case (Sprint 3 journey edge case).
  if (session.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="text-3xl">🎓</div>
        <h2 className="mt-2 text-lg font-semibold">
          You&apos;ve practiced all reactions!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {categoryName
            ? `No more reactions left in ${categoryName}.`
            : "No reactions are available for this chapter yet."}{" "}
          Try the boss level.
        </p>
      </div>
    );
  }

  const reaction = session[current];
  const xp = xpForDifficulty(reaction.difficulty);

  async function handleAnswered(result: AnsweredResult) {
    const r = session.find((x) => x.id === result.reactionId)!;

    // Detect mastery for this session: was already at 2 correct in DB, now +1?
    // We only have a coarse signal for guests; for logged-in users the API
    // returns the authoritative newlyMastered flag, applied below.
    let unlockedCard = false;

    if (result.correct) {
      setXpEarned((x) => x + result.xp);
      if (isGuest) {
        const award = awardGuestXp(result.xp, "module_1_correct");
        if (award.leveledUp) fireLevelUp(award.newLevelTitle);
      } else {
        // Award XP, then record progress (mastery / card unlock authoritative).
        try {
          const res = await fetch("/api/xp/award", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: result.xp, action: "module_1_correct" }),
          });
          const data = await res.json();
          if (res.ok && data.leveledUp) fireLevelUp(data.newLevelTitle);
        } catch {
          /* network error — XP just won't persist; keep the session going */
        }
      }
    }

    if (isGuest) {
      recordGuestResult(result.reactionId, result.correct);
    } else {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reactionId: result.reactionId,
            correct: result.correct,
          }),
        });
        const data = await res.json();
        if (res.ok && data.newlyMastered) unlockedCard = true;
      } catch {
        /* non-fatal */
      }
    }

    setResults((prev) => [
      ...prev,
      {
        reactionId: result.reactionId,
        name: r.name,
        correct: result.correct,
        unlockedCard: unlockedCard && !masteredSet.has(result.reactionId),
      },
    ]);
  }

  function handleNext() {
    if (current + 1 >= session.length) {
      setPhase("summary");
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleTryAgain() {
    setCurrent(0);
    setResults([]);
    setXpEarned(0);
    setPhase("playing");
    setSessionKey((k) => k + 1);
  }

  if (phase === "summary") {
    return (
      <SessionSummary
        results={results}
        xpEarned={xpEarned}
        chapterId={chapterId}
        isGuest={isGuest}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <QuestionCard
      key={`${sessionKey}-${reaction.id}-${current}`}
      reaction={reaction}
      index={current + 1}
      total={session.length}
      xp={xp}
      onAnswered={handleAnswered}
      onNext={handleNext}
    />
  );
}
