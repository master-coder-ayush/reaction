"use client";

import { Check, X } from "lucide-react";
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
        "flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3 text-left text-sm font-semibold transition-all",
        "disabled:cursor-default",
        state === "idle" &&
          "border-border hover:-translate-y-px hover:border-secondary hover:bg-secondary-soft/40",
        state === "selected" && "border-secondary bg-secondary-soft text-secondary-border",
        state === "correct" &&
          "border-primary bg-primary-soft text-primary-border",
        state === "wrong" && "border-destructive bg-destructive-soft text-destructive-border"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
          state === "correct" && "bg-primary text-primary-foreground",
          state === "wrong" && "bg-destructive text-destructive-foreground",
          state === "selected" && "bg-secondary text-secondary-foreground",
          state === "idle" && "bg-muted text-muted-foreground"
        )}
      >
        {state === "correct" ? (
          <Check className="h-4 w-4" />
        ) : state === "wrong" ? (
          <X className="h-4 w-4" />
        ) : (
          letter
        )}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  );
}
