"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnswerOption, type AnswerState } from "@/components/AnswerOption";
import { BossTimer } from "@/components/BossTimer";
import { BossResults } from "@/components/BossResults";
import { Button } from "@/components/ui/button";
import { reactionColorVar } from "@/lib/constants";
import { maskEquation } from "@/lib/utils";
import { fireLevelUp } from "@/components/LevelUpToast";
import { fireBadgeEarned } from "@/lib/badge-client";
import { awardGuestXp } from "@/lib/guest";
import { BOSS_TIME_SECONDS, BOSS_XP_AWARD, type BossQuestion } from "@/lib/boss-client";
import type { WeakArea } from "@/components/WeakAreaCards";
import type { ReactionOptionDTO } from "@/app/api/reactions/route";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Module 1 question-type priority (mirrors QuestionCard) for "build" questions.
const BUILD_PRIORITY = ["reagent", "product", "reactant"] as const;
const TYPE_LABEL: Record<string, string> = {
  reagent: "Pick the correct reagent",
  product: "Pick the correct product",
  reactant: "Pick the correct reactant",
  name: "Name this reaction",
};

type Props = {
  chapter: number;
  questions: BossQuestion[];
  isGuest: boolean;
};

type Phase = "playing" | "results";

type Outcome = {
  score: number;
  passed: boolean;
  nextChapterName: string | null;
  attemptsUsed: number;
};

/**
 * Boss-level orchestrator (Sprint 5 §5.1). Walks the 20 questions under a 10:00
 * timer, no hints, recording correctness per question. On timer expiry or the
 * last answer it submits to /api/boss/submit, which scores, awards XP + badge,
 * and unlocks the next chapter. Tracks wrong answers for the weak-area report.
 */
export function BossSession({ chapter, questions, isGuest }: Props) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);

  // Per-question correctness, indexed by position. A ref so the timer's
  // auto-submit reads the latest without re-rendering the timer.
  const answeredRef = useRef<boolean[]>(new Array(questions.length).fill(false));
  const submittingRef = useRef(false);

  const total = questions.length;
  const question = questions[current];

  // Resolve the option set + question type for the current question.
  const { options, questionType } = useMemo(() => {
    if (!question) return { options: [] as ReactionOptionDTO[], questionType: "name" };
    if (question.mode === "name") {
      return {
        options: question.options
          .filter((o) => o.optionType === "name")
          .sort((a, b) => a.displayOrder - b.displayOrder),
        questionType: "name",
      };
    }
    const type =
      BUILD_PRIORITY.find((t) =>
        question.options.some((o) => o.optionType === t)
      ) ?? "reagent";
    return {
      options: question.options
        .filter((o) => o.optionType === type)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      questionType: type,
    };
  }, [question]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function finish() {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const score = answeredRef.current.filter(Boolean).length;

    // Compute weak areas: wrong questions, de-duplicated by reaction, up to 3.
    const weak: WeakArea[] = [];
    const seen = new Set<number>();
    questions.forEach((q, i) => {
      if (answeredRef.current[i]) return;
      if (seen.has(q.id)) return;
      seen.add(q.id);
      weak.push({
        reactionId: q.id,
        name: q.name,
        why: q.whyText,
        module: q.mode === "name" ? 2 : 1,
      });
    });
    setWeakAreas(weak.slice(0, 3));

    if (isGuest) {
      const passed = score >= 16;
      if (passed) {
        const award = awardGuestXp(BOSS_XP_AWARD, "boss_cleared");
        if (award.leveledUp) fireLevelUp(award.newLevelTitle);
      }
      setOutcome({ score, passed, nextChapterName: null, attemptsUsed: 0 });
      setPhase("results");
      return;
    }

    try {
      const res = await fetch("/api/boss/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter, score }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.leveledUp) fireLevelUp(data.newLevelTitle);
        for (const badge of data.awardedBadges ?? []) fireBadgeEarned(badge);
        setOutcome({
          score: data.score ?? score,
          passed: !!data.passed,
          nextChapterName: data.nextChapterName ?? null,
          attemptsUsed: data.attemptsUsed ?? 0,
        });
      } else {
        setOutcome({ score, passed: score >= 16, nextChapterName: null, attemptsUsed: 0 });
      }
    } catch {
      setOutcome({ score, passed: score >= 16, nextChapterName: null, attemptsUsed: 0 });
    }
    setPhase("results");
  }

  function handleSubmitAnswer() {
    if (selectedId == null) return;
    const chosen = options.find((o) => o.id === selectedId);
    answeredRef.current[current] = !!chosen?.isCorrect;

    if (current + 1 >= total) {
      void finish();
    } else {
      setCurrent((c) => c + 1);
      setSelectedId(null);
    }
  }

  if (phase === "results" && outcome) {
    return (
      <BossResults
        chapter={chapter}
        score={outcome.score}
        passed={outcome.passed}
        nextChapterName={outcome.nextChapterName}
        weakAreas={weakAreas}
        attemptsUsed={outcome.attemptsUsed}
        isGuest={isGuest}
        onTryAgain={() => window.location.reload()}
      />
    );
  }

  if (!question) return null;

  const accent = reactionColorVar(question.reactionTypeColor);
  const isNameMode = questionType === "name";

  return (
    <div>
      {/* Progress + timer, visible at all times (Sprint 5 §5.1). */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-extrabold tabular-nums">
          Question {current + 1} / {total}
        </span>
        <BossTimer seconds={BOSS_TIME_SECONDS} onExpire={finish} />
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question card — no hints, no confetti during the boss. */}
      <div className="card-soft mt-4 p-5 sm:p-6">
        <div className="flex items-center justify-end text-xs">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {question.reactionTypeName}
          </span>
        </div>

        {isNameMode ? (
          <p className="mt-3 text-sm text-muted-foreground">{question.questionText}</p>
        ) : (
          <>
            <h2 className="mt-3 text-lg font-extrabold tracking-tight">{question.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{question.questionText}</p>
          </>
        )}

        {question.equationText && (
          <p
            className={
              "mt-3 rounded-xl border border-border bg-muted px-3 py-2 text-center font-mono " +
              (isNameMode ? "text-lg font-semibold" : "text-base")
            }
          >
            {maskEquation(
              question.equationText,
              options.find((o) => o.isCorrect)?.text ?? "",
              questionType,
            )}
          </p>
        )}

        <p className="mt-4 text-sm font-bold">
          {TYPE_LABEL[questionType] ?? "Choose the correct option"}
        </p>

        <div className="mt-3 space-y-2.5">
          {options.map((o, i) => (
            <AnswerOption
              key={o.id}
              text={o.text}
              letter={LETTERS[i]}
              state={optionState(o, selectedId)}
              disabled={false}
              onSelect={() => setSelectedId(o.id)}
            />
          ))}
        </div>

        <Button
          type="button"
          onClick={handleSubmitAnswer}
          disabled={selectedId == null}
          className="mt-5 w-full"
        >
          {current + 1 >= total ? (
            "Finish Boss Level"
          ) : (
            <>
              Next <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// During the boss there's no per-question feedback — options only reflect
// selection, never correct/wrong (that's revealed on the results screen).
function optionState(o: ReactionOptionDTO, selectedId: number | null): AnswerState {
  return o.id === selectedId ? "selected" : "idle";
}
