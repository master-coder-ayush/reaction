"use client";

import Link from "next/link";
import { CheckCircle2, Zap, Unlock, ArrowLeft, ArrowRight, Dumbbell } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { WeakAreaCards, type WeakArea } from "@/components/WeakAreaCards";
import { Button } from "@/components/ui/button";
import {
  BOSS_PASS_THRESHOLD,
  BOSS_QUESTION_COUNT,
  BOSS_DAILY_ATTEMPT_LIMIT,
} from "@/lib/boss-client";

// Boss results screen (Sprint 5 §5.1). Pass (≥16/20): celebratory, +200 XP, the
// badge reveal (fired separately via the global badge-earned event), and the
// "next chapter unlocked" line + a link back to the map. Fail (<16/20): score,
// up to 3 weak-area quick-practice cards, and Try Again / Come Back Tomorrow.

type Props = {
  chapter: number;
  score: number;
  passed: boolean;
  /** Next chapter name unlocked by this clear (pass only), if any. */
  nextChapterName: string | null;
  /** Weak areas for the fail screen. */
  weakAreas: WeakArea[];
  /** Boss attempts used today (after this submit). */
  attemptsUsed: number;
  /** Guests don't persist; copy adapts slightly. */
  isGuest: boolean;
  onTryAgain: () => void;
};

export function BossResults({
  chapter,
  score,
  passed,
  nextChapterName,
  weakAreas,
  attemptsUsed,
  isGuest,
  onTryAgain,
}: Props) {
  const canRetry = isGuest || attemptsUsed < BOSS_DAILY_ATTEMPT_LIMIT;

  if (passed) {
    const perfect = score >= BOSS_QUESTION_COUNT;
    return (
      <div className="card-soft relative overflow-hidden p-6 text-center">
        <Confetti />
        <span className="icon-chip mx-auto bg-primary-soft text-primary-border" aria-hidden>
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
          Boss Cleared! {score}/{BOSS_QUESTION_COUNT}
        </h2>
        {perfect && (
          <p className="mt-1 text-sm font-bold text-primary-border">
            💯 Perfect run!
          </p>
        )}

        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold text-primary-border">
          <Zap className="h-4 w-4" aria-hidden /> +200 XP
        </div>

        {!isGuest && nextChapterName && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-secondary-soft px-4 py-3 text-sm font-bold text-secondary-border">
            <Unlock className="h-4 w-4" aria-hidden /> {nextChapterName} chapter is
            now unlocked!
          </p>
        )}
        {isGuest && (
          <p className="mt-5 text-sm text-muted-foreground">
            Sign up to keep your badge and unlock the next chapter for good.
          </p>
        )}

        <Link
          href="/learn"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-(--primary-border) bg-primary px-4 text-sm font-extrabold tracking-wide text-primary-foreground btn-chunky"
        >
          Back to Chapter Map <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="card-soft p-6 text-center">
      <span className="icon-chip mx-auto bg-destructive-soft" aria-hidden>
        <Dumbbell className="h-6 w-6 text-destructive-border" />
      </span>
      <h2 className="mt-3 text-xl font-extrabold tracking-tight">Not quite! You need {BOSS_PASS_THRESHOLD}/{BOSS_QUESTION_COUNT}.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You scored{" "}
        <span className="font-bold text-foreground">
          {score}/{BOSS_QUESTION_COUNT}
        </span>
        .
      </p>

      <WeakAreaCards chapter={chapter} areas={weakAreas} />

      <div className="mt-6">
        {canRetry ? (
          <Button type="button" onClick={onTryAgain} className="w-full">
            Try Again
          </Button>
        ) : (
          <div className="rounded-xl bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">
            Daily attempt limit reached. Come back tomorrow.
          </div>
        )}
        <Link
          href="/learn"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Chapter Map
        </Link>
      </div>
    </div>
  );
}
