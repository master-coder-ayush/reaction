"use client";

// Hint + story/why panel (Sprint 3 §3.4). Styled as a "chemistry teacher's
// note" card that slides in (see `hint-slide` in globals.css). Hints never cost
// XP — they appear automatically after an answer.
//
//  - `story` is shown after every answer (correct or wrong).
//  - `hint` + `why` are shown only after a wrong answer.

type Props = {
  /** Wrong-answer hint, chosen by which option type was missed. */
  hint?: string | null;
  /** Always shown after an answer. */
  story?: string | null;
  /** Shown only on a wrong answer, below the hint. */
  why?: string | null;
  wasCorrect: boolean;
};

export function HintPanel({ hint, story, why, wasCorrect }: Props) {
  const showHint = !wasCorrect && !!hint;
  const showWhy = !wasCorrect && !!why;

  if (!showHint && !showWhy && !story) return null;

  return (
    <div className="hint-slide mt-4 space-y-3">
      {showHint && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mb-1 flex items-center gap-1.5 font-semibold">
            <span aria-hidden>👩‍🔬</span> Teacher&apos;s note
          </div>
          <p>{hint}</p>
          {showWhy && (
            <p className="mt-2 border-t border-amber-300/40 pt-2 text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Why: </span>
              {why}
            </p>
          )}
        </div>
      )}

      {story && (
        <div className="rounded-xl border border-border bg-muted p-4 text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-muted-foreground">
            <span aria-hidden>📖</span> The story
          </div>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
}
