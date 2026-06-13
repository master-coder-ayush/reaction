"use client";

import { cn } from "@/lib/utils";

// A single MCQ option button (Sprint 3 §3.1). Before submit it can be selected
// (highlighted). After submit it is locked and reveals correctness: green border
// on the correct option, red border on a wrong selected option.

export type AnswerState = "idle" | "selected" | "correct" | "wrong";

type Props = {
  text: string;
  state: AnswerState;
  disabled: boolean;
  onSelect: () => void;
  /** A / B / C / D label. */
  letter: string;
};

export function AnswerOption({ text, state, disabled, onSelect, letter }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left text-sm font-medium transition-colors",
        "disabled:cursor-default",
        state === "idle" &&
          "border-border hover:border-primary/60 hover:bg-muted",
        state === "selected" && "border-primary bg-primary/5",
        state === "correct" &&
          "border-success bg-success/10 text-foreground",
        state === "wrong" && "border-destructive bg-destructive/10"
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          state === "correct" && "border-success text-success",
          state === "wrong" && "border-destructive text-destructive",
          (state === "idle" || state === "selected") &&
            "border-muted-foreground/40 text-muted-foreground"
        )}
      >
        {state === "correct" ? "✓" : state === "wrong" ? "✗" : letter}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
