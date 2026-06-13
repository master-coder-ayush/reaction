"use client";

import { useState } from "react";
import Link from "next/link";
import { BossSession } from "@/components/BossSession";
import {
  BOSS_DAILY_ATTEMPT_LIMIT,
  BOSS_PASS_THRESHOLD,
  BOSS_QUESTION_COUNT,
  type BossQuestion,
} from "@/lib/boss";

// Boss entry → session wrapper (Sprint 5 §5.1). Shows the entry screen (rules +
// reward preview + Start), then hands off to <BossSession> once started. The
// daily attempt count is computed server-side and passed in; the Start button is
// disabled when the limit is reached.

type Props = {
  chapter: number;
  chapterName: string;
  questions: BossQuestion[];
  /** Boss badge name this clear awards (reward preview). */
  badgeName: string | null;
  attemptsUsed: number;
  isGuest: boolean;
};

export function BossEntry({
  chapter,
  chapterName,
  questions,
  badgeName,
  attemptsUsed,
  isGuest,
}: Props) {
  const [started, setStarted] = useState(false);

  const limitReached = !isGuest && attemptsUsed >= BOSS_DAILY_ATTEMPT_LIMIT;
  const noQuestions = questions.length === 0;

  if (started && !noQuestions) {
    return <BossSession chapter={chapter} questions={questions} isGuest={isGuest} />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Boss Level
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{chapterName}</h1>

      <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm font-medium">
        {BOSS_QUESTION_COUNT} questions · 10 minutes · Need {BOSS_PASS_THRESHOLD}/
        {BOSS_QUESTION_COUNT} to clear
      </p>

      {/* Reward preview */}
      <div className="mt-4 text-left">
        <h2 className="text-sm font-semibold">Clear it to earn</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>🏅 {badgeName ?? "Boss badge"}</li>
          <li>⭐ +200 XP</li>
          <li>🎴 {chapterName} chapter card</li>
        </ul>
      </div>

      {noQuestions ? (
        <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This chapter doesn&apos;t have enough questions for a boss level yet.
        </p>
      ) : limitReached ? (
        <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
          Daily attempt limit reached. Come back tomorrow.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Start Boss Level
          </button>
          {!isGuest && (
            <p className="mt-2 text-xs text-muted-foreground">
              {BOSS_DAILY_ATTEMPT_LIMIT - attemptsUsed} of{" "}
              {BOSS_DAILY_ATTEMPT_LIMIT} attempts left today
            </p>
          )}
        </>
      )}

      <Link
        href="/learn"
        className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Chapter Map
      </Link>
    </div>
  );
}
