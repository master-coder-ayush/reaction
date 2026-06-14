"use client";

import { useState } from "react";
import Link from "next/link";
import { Swords, Medal, Star, Layers, ArrowLeft } from "lucide-react";
import { BossSession } from "@/components/BossSession";
import { Button } from "@/components/ui/button";
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
    <div className="card-soft p-6 text-center">
      <span className="icon-chip mx-auto bg-destructive-soft text-destructive-border" aria-hidden>
        <Swords className="h-6 w-6" />
      </span>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-destructive-border">
        Boss Level
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{chapterName}</h1>

      <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm font-bold">
        {BOSS_QUESTION_COUNT} questions · 10 minutes · Need {BOSS_PASS_THRESHOLD}/
        {BOSS_QUESTION_COUNT} to clear
      </p>

      {/* Reward preview */}
      <div className="mt-4 text-left">
        <h2 className="text-sm font-bold">Clear it to earn</h2>
        <ul className="mt-2 space-y-1.5 text-sm font-semibold text-muted-foreground">
          <li className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-warning" aria-hidden />
            {badgeName ?? "Boss badge"}
          </li>
          <li className="flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" aria-hidden /> +200 XP
          </li>
          <li className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" aria-hidden /> {chapterName}{" "}
            chapter card
          </li>
        </ul>
      </div>

      {noQuestions ? (
        <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This chapter doesn&apos;t have enough questions for a boss level yet.
        </p>
      ) : limitReached ? (
        <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">
          Daily attempt limit reached. Come back tomorrow.
        </p>
      ) : (
        <>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={() => setStarted(true)}
            className="mt-6 w-full"
          >
            Start Boss Level
          </Button>
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
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Chapter Map
      </Link>
    </div>
  );
}
