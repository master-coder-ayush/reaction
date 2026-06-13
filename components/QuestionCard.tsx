"use client";

import { useMemo, useState } from "react";
import { AnswerOption, type AnswerState } from "@/components/AnswerOption";
import { HintPanel } from "@/components/HintPanel";
import { Confetti } from "@/components/Confetti";
import { XPAnimation } from "@/components/XPAnimation";
import { reactionColorVar } from "@/lib/constants";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Module 1 question priority: reagent is the primary question type; fall back to
// product, then reactant, then name (whatever this reaction has options for).
const TYPE_PRIORITY = ["reagent", "product", "reactant", "name"] as const;

function pickQuestionType(options: ReactionOptionDTO[]): string {
  for (const t of TYPE_PRIORITY) {
    if (options.some((o) => o.optionType === t)) return t;
  }
  return options[0]?.optionType ?? "reagent";
}

const TYPE_LABEL: Record<string, string> = {
  reagent: "Pick the correct reagent",
  product: "Pick the correct product",
  reactant: "Pick the correct reactant",
  name: "Name this reaction",
};

export type AnsweredResult = {
  reactionId: number;
  correct: boolean;
  xp: number;
};

type Props = {
  reaction: ReactionDTO;
  /** 1-based index in the session, for the progress display. */
  index: number;
  total: number;
  /** XP awarded for a correct answer (difficulty-based). */
  xp: number;
  onAnswered: (result: AnsweredResult) => void;
  onNext: () => void;
};

/**
 * Module 1 "Build the Reaction" question card (Sprint 3 §3.1). Shows the
 * conversion goal + equation, a 4-option MCQ for the reaction's primary question
 * type, and the full correct/wrong answer flow (confetti, +XP, story, hints).
 */
export function QuestionCard({
  reaction,
  index,
  total,
  xp,
  onAnswered,
  onNext,
}: Props) {
  const questionType = useMemo(
    () => pickQuestionType(reaction.options),
    [reaction.options]
  );

  // Only the options for the chosen question type, in display order.
  const options = useMemo(
    () =>
      reaction.options
        .filter((o) => o.optionType === questionType)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [reaction.options, questionType]
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selected = options.find((o) => o.id === selectedId) ?? null;
  const wasCorrect = !!selected?.isCorrect;
  const accent = reactionColorVar(reaction.reactionTypeColor);

  // Which hint to show, based on the question type that was answered wrong.
  const hint =
    questionType === "reagent"
      ? reaction.hintWrongReagent
      : questionType === "product"
        ? reaction.hintWrongProduct
        : questionType === "reactant"
          ? reaction.hintWrongReactant
          : reaction.hintWrongReagent;

  function handleSubmit() {
    if (submitted || selectedId == null || !selected) return;
    setSubmitted(true);
    onAnswered({
      reactionId: reaction.id,
      correct: !!selected.isCorrect,
      xp,
    });
  }

  function optionState(o: ReactionOptionDTO): AnswerState {
    if (!submitted) return o.id === selectedId ? "selected" : "idle";
    if (o.isCorrect) return "correct";
    if (o.id === selectedId) return "wrong";
    return "idle";
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {submitted && wasCorrect && (
        <>
          <Confetti />
          <XPAnimation amount={xp} />
        </>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          Question {index} of {total}
        </span>
        <span
          className="rounded-full px-2 py-0.5 font-medium text-white"
          style={{ backgroundColor: accent }}
        >
          {reaction.reactionTypeName}
        </span>
      </div>

      <h2 className="mt-3 text-lg font-semibold">{reaction.name}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {reaction.questionText}
      </p>

      {reaction.equationText && (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-center font-mono text-base">
          {reaction.equationText}
        </p>
      )}

      <p className="mt-4 text-sm font-medium">
        {TYPE_LABEL[questionType] ?? "Choose the correct option"}
      </p>

      <div className="mt-3 space-y-2.5">
        {options.map((o, i) => (
          <AnswerOption
            key={o.id}
            text={o.text}
            letter={LETTERS[i]}
            state={optionState(o)}
            disabled={submitted}
            onSelect={() => !submitted && setSelectedId(o.id)}
          />
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedId == null}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      ) : (
        <>
          <div
            className={
              "mt-4 rounded-lg px-3 py-2 text-sm font-semibold " +
              (wasCorrect
                ? "bg-success/15 text-success"
                : "bg-destructive/10 text-destructive")
            }
          >
            {wasCorrect ? "✓ Correct! +" + xp + " XP" : "✗ Not quite."}
          </div>

          <HintPanel
            hint={hint}
            story={reaction.storyText}
            why={reaction.whyText}
            wasCorrect={wasCorrect}
          />

          <button
            type="button"
            onClick={onNext}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            {wasCorrect ? "Next →" : "Try Next →"}
          </button>
        </>
      )}
    </div>
  );
}
