"use client";

import Link from "next/link";
import { Zap, Check, X, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

// Session summary shown after 5 questions (Sprint 3 §3.2). Score, XP earned,
// per-reaction ✓/✗, "struggled with" prompts, any unlocked cards, and (for
// guests) a subtle sign-up nudge — never a modal.

export type SessionReactionResult = {
  reactionId: number;
  name: string;
  correct: boolean;
  /** True if this reaction reached 3 correct total this session (card unlocked). */
  unlockedCard?: boolean;
};

type Props = {
  results: SessionReactionResult[];
  xpEarned: number;
  chapterId: number;
  isGuest: boolean;
  onTryAgain: () => void;
};

export function SessionSummary({
  results,
  xpEarned,
  chapterId,
  isGuest,
  onTryAgain,
}: Props) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Reactions with no correct answer this session → "practice again tomorrow".
  const struggled = results.filter((r) => !r.correct);
  const unlocked = results.filter((r) => r.unlockedCard);

  return (
    <div className="card-soft p-6">
      <div className="text-center">
        <div className="text-4xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <h2 className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight">
          {correct} / {total}
        </h2>
        <p className="text-sm font-semibold text-muted-foreground">{pct}% correct</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary-border">
          <Zap className="h-4 w-4" aria-hidden /> +{xpEarned} XP this session
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {results.map((r, i) => (
          <li
            key={`${r.reactionId}-${i}`}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <span
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white " +
                  (r.correct ? "bg-primary" : "bg-destructive")
                }
                aria-hidden
              >
                {r.correct ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </span>
              {r.name}
            </span>
            {r.unlockedCard && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-border">
                <Sparkles className="h-3 w-3" aria-hidden /> Card unlocked
              </span>
            )}
          </li>
        ))}
      </ul>

      {unlocked.length > 0 && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-soft px-3 py-2 text-sm font-bold text-accent-border">
          <Sparkles className="h-4 w-4" aria-hidden /> {unlocked.length} reaction card
          {unlocked.length > 1 ? "s" : ""} unlocked!
        </p>
      )}

      {struggled.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {struggled.map((r) => (
            <p
              key={r.reactionId}
              className="flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warn-border"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                You struggled with <span className="font-bold">{r.name}</span> —
                practice it again tomorrow.
              </span>
            </p>
          ))}
        </div>
      )}

      {isGuest && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Sign up
          </Link>{" "}
          to save your progress and earn streaks.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={onTryAgain} className="flex-1">
          Try Again
        </Button>
        <Link
          href={`/learn`}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border-2 border-border bg-card px-4 text-sm font-extrabold tracking-wide shadow-[0_4px_0_var(--border)] transition-all hover:-translate-y-px active:translate-y-0.5 active:shadow-none"
        >
          Back to Chapter
        </Link>
      </div>
      <p className="sr-only">Chapter {chapterId}</p>
    </div>
  );
}
