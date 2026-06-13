"use client";

import Link from "next/link";
import { Confetti } from "@/components/Confetti";
import { WeakAreaCards, type WeakArea } from "@/components/WeakAreaCards";
import {
  BOSS_PASS_THRESHOLD,
  BOSS_QUESTION_COUNT,
  BOSS_DAILY_ATTEMPT_LIMIT,
} from "@/lib/boss";

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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <Confetti />
        <div className="text-4xl">✅</div>
        <h2 className="mt-3 text-2xl font-bold">
          Boss Cleared! {score}/{BOSS_QUESTION_COUNT}
        </h2>
        {perfect && (
          <p className="mt-1 text-sm font-semibold text-success">
            💯 Perfect run!
          </p>
        )}

        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
          +200 XP
        </div>

        {!isGuest && nextChapterName && (
          <p className="mt-5 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            🔓 {nextChapterName} chapter is now unlocked!
          </p>
        )}
        {isGuest && (
          <p className="mt-5 text-sm text-muted-foreground">
            Sign up to keep your badge and unlock the next chapter for good.
          </p>
        )}

        <Link
          href="/learn"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Back to Chapter Map →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="text-4xl">💪</div>
      <h2 className="mt-3 text-xl font-bold">Not quite! You need {BOSS_PASS_THRESHOLD}/{BOSS_QUESTION_COUNT}.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You scored{" "}
        <span className="font-semibold text-foreground">
          {score}/{BOSS_QUESTION_COUNT}
        </span>
        .
      </p>

      <WeakAreaCards chapter={chapter} areas={weakAreas} />

      <div className="mt-6">
        {canRetry ? (
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Try Again
          </button>
        ) : (
          <div className="rounded-xl bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
            Daily attempt limit reached. Come back tomorrow.
          </div>
        )}
        <Link
          href="/learn"
          className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Chapter Map
        </Link>
      </div>
    </div>
  );
}
