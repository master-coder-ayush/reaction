"use client";

import { GraduationCap, BookOpen } from "lucide-react";

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
        <div className="rounded-2xl border border-warning-soft bg-warning-soft p-4 text-sm text-warn-border shadow-soft">
          <div className="mb-1 flex items-center gap-1.5 font-bold">
            <GraduationCap className="h-4 w-4" aria-hidden /> Teacher&apos;s note
          </div>
          <p>{hint}</p>
          {showWhy && (
            <p className="mt-2 border-t border-warn/20 pt-2 text-warn-border/90">
              <span className="font-bold">Why: </span>
              {why}
            </p>
          )}
        </div>
      )}

      {story && (
        <div className="rounded-2xl border border-border bg-muted p-4 text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-bold text-muted-foreground">
            <BookOpen className="h-4 w-4" aria-hidden /> The story
          </div>
          <p>{story}</p>
        </div>
      )}
    </div>
  );
}
