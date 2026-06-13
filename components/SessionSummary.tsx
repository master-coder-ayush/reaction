"use client";

import Link from "next/link";

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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="text-center">
        <div className="text-4xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <h2 className="mt-2 text-2xl font-bold tabular-nums">
          {correct} / {total}
        </h2>
        <p className="text-sm text-muted-foreground">{pct}% correct</p>
        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-success">
          <span aria-hidden>⚡</span> +{xpEarned} XP this session
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {results.map((r, i) => (
          <li
            key={`${r.reactionId}-${i}`}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{r.correct ? "✅" : "❌"}</span>
              {r.name}
            </span>
            {r.unlockedCard && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                🃏 Card unlocked
              </span>
            )}
          </li>
        ))}
      </ul>

      {unlocked.length > 0 && (
        <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          🃏 {unlocked.length} reaction card{unlocked.length > 1 ? "s" : ""} unlocked!
        </p>
      )}

      {struggled.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {struggled.map((r) => (
            <p
              key={r.reactionId}
              className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              You struggled with <span className="font-semibold">{r.name}</span> —
              practice it again tomorrow.
            </p>
          ))}
        </div>
      )}

      {isGuest && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>{" "}
          to save your progress and earn streaks.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href={`/learn`}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Back to Chapter
        </Link>
      </div>
      <p className="sr-only">Chapter {chapterId}</p>
    </div>
  );
}
