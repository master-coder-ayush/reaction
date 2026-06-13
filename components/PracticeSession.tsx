"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionCard, type AnsweredResult } from "@/components/QuestionCard";
import {
  SessionSummary,
  type SessionReactionResult,
} from "@/components/SessionSummary";
import { fireLevelUp } from "@/components/LevelUpToast";
import { awardGuestXp, recordGuestResult } from "@/lib/guest";
import { pickSession, SESSION_SIZE } from "@/lib/session";
import { xpForDifficulty, XP_AWARDS } from "@/lib/xp";
import { reportBadgeEvents, fireBadgeEarned } from "@/lib/badge-client";
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
  /** Which practice module this session is for. Defaults to Module 1. */
  module?: 1 | 2;
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
  module = 1,
}: Props) {
  const isNameModule = module === 2;
  // Re-pick trigger for "Try Again".
  const [sessionKey, setSessionKey] = useState(0);

  // Session selection uses Math.random, so it must run only on the client —
  // doing it during render would mismatch the server's choice and break
  // hydration. Pick after mount (and on each Try Again) into state.
  const [session, setSession] = useState<ReactionDTO[] | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(pickSession(reactions, attemptsById, SESSION_SIZE));
    // attemptsById is stable per page load; re-pick only on Try Again / data change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactions, sessionKey]);

  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [results, setResults] = useState<SessionReactionResult[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  // Running correct counts (prior DB count for logged-in users + this session).
  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);

  // Consecutive-correct counter within this session, for the "On a Roll" badge
  // (3 in a row). A ref — it drives no rendering. Reset on Try Again.
  const correctStreakRef = useRef(0);

  // Before the client-side selection runs, show a light placeholder. (The
  // server renders this branch too, so server/client markup matches.)
  if (session === null) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

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

  // `session` is non-null past the guard above; bind a narrowed local so the
  // event handlers (closures) keep the non-null type.
  const activeSession = session;
  const reaction = activeSession[current];
  // Module 2 "Name the Reaction" awards a flat +20 XP (Sprint 4 §4.1); Module 1
  // stays difficulty-scaled.
  const xp = isNameModule
    ? XP_AWARDS.CORRECT_MEDIUM
    : xpForDifficulty(reaction.difficulty);

  async function handleAnswered(result: AnsweredResult) {
    const r = activeSession.find((x) => x.id === result.reactionId)!;

    // Detect mastery for this session: was already at 2 correct in DB, now +1?
    // We only have a coarse signal for guests; for logged-in users the API
    // returns the authoritative newlyMastered flag, applied below.
    let unlockedCard = false;
    const action = isNameModule ? "module_2_correct" : "module_1_correct";

    // Track the in-session correct streak for the "On a Roll" badge (3 in a row).
    correctStreakRef.current = result.correct ? correctStreakRef.current + 1 : 0;
    const hitCorrectStreak3 = result.correct && correctStreakRef.current === 3;

    if (result.correct) {
      setXpEarned((x) => x + result.xp);
      if (isGuest) {
        const award = awardGuestXp(result.xp, action);
        if (award.leveledUp) fireLevelUp(award.newLevelTitle);
      } else {
        // Award XP, then record progress (mastery / card unlock authoritative).
        try {
          const res = await fetch("/api/xp/award", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: result.xp, action }),
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
        // Streak-milestone badges are awarded server-side; reveal them here.
        if (res.ok && Array.isArray(data.awardedBadges)) {
          for (const badge of data.awardedBadges) fireBadgeEarned(badge);
        }
      } catch {
        /* non-fatal */
      }

      // Badge events (logged-in only). The server checks each and awards any
      // newly-earned badge, firing the reveal toast. FIRST_REACTION is checked on
      // every correct answer (server dedups); CORRECT_STREAK_3 only when hit.
      if (result.correct) {
        const events = ["FIRST_REACTION"];
        if (hitCorrectStreak3) events.push("CORRECT_STREAK_3");
        void reportBadgeEvents(events);
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
    if (current + 1 >= activeSession.length) {
      setPhase("summary");
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleTryAgain() {
    setCurrent(0);
    setResults([]);
    setXpEarned(0);
    correctStreakRef.current = 0;
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
      total={activeSession.length}
      xp={xp}
      onAnswered={handleAnswered}
      onNext={handleNext}
      forceType={isNameModule ? "name" : undefined}
    />
  );
}
