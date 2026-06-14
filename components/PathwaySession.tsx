"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { PathwayChain } from "@/components/PathwayChain";
import { Button } from "@/components/ui/button";
import { fireLevelUp } from "@/components/LevelUpToast";
import { fireBadgeEarned } from "@/lib/badge-client";
import { awardGuestXp } from "@/lib/guest";
import { reactionColorVar } from "@/lib/constants";
import {
  PATHWAY_COMPLETE_XP,
  PATHWAY_STEP_XP,
  type PathwayDTO,
} from "@/lib/pathway-client";

// ---------------------------------------------------------------------------
// PathwaySession (Sprint 6 §6.1). Plays one pathway challenge step-by-step:
// shows the current compound + conversion goal, asks "what is X converted to?",
// offers 4 compound options, and on a correct pick grows the visual chain and
// awards +20 XP. Wrong picks gently shake (no penalty, re-attempt). After the
// last step it shows the completed chain, awards the +80 bonus, persists the
// result (logged-in), and lets the student pick another pathway.
//
// Guests get the same play loop with XP credited to localStorage; persistence /
// badge / card all require an account.
// ---------------------------------------------------------------------------

type Phase = "playing" | "complete";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PathwaySession({
  pathway,
  allCompounds,
  isGuest,
  onExit,
}: {
  pathway: PathwayDTO;
  /** Compound names from across the chapter, used as wrong-option distractors. */
  allCompounds: string[];
  isGuest: boolean;
  /** Back to the pathway list (e.g. to pick another). */
  onExit: () => void;
}) {
  // currentStep is the index of the compound the student is *standing on*; they
  // pick the compound at currentStep + 1. Reaches steps.length - 1 = done.
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(false);

  const steps = pathway.steps;
  const target = steps[currentStep + 1]; // the compound to identify next

  // Build 4 options for the current step: the correct next compound + 3
  // distractors drawn from other chapter compounds. Stable per step.
  const options = useMemo(() => {
    if (!target) return [];
    const correct = target.compoundName;
    const pool = allCompounds.filter(
      (c) => c !== correct && !steps.some((s) => s.compoundName === c)
    );
    // Fall back to other pathway compounds if the chapter pool is thin.
    const fallback = steps
      .map((s) => s.compoundName)
      .filter((c) => c !== correct);
    const distractors = shuffle([...new Set([...pool, ...fallback])]).slice(0, 3);
    return shuffle([correct, ...distractors]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  function handlePick(option: string) {
    if (!target) return;
    if (option !== target.compoundName) {
      setWrongKey(option);
      window.setTimeout(() => setWrongKey(null), 450);
      return;
    }

    // Correct step → +20 XP, grow the chain.
    setXpEarned((x) => x + PATHWAY_STEP_XP);
    if (isGuest) {
      const award = awardGuestXp(PATHWAY_STEP_XP, "pathway_step");
      if (award.leveledUp) fireLevelUp(award.newLevelTitle);
    } else {
      // Step XP for logged-in users is folded into the single
      // /api/pathway/complete award at the end, so we don't double-credit here.
    }

    const next = currentStep + 1;
    if (next >= steps.length - 1) {
      void finish();
    } else {
      setCurrentStep(next);
    }
  }

  async function finish() {
    setCurrentStep(steps.length - 1);
    setPhase("complete");

    // Completion bonus.
    setXpEarned((x) => x + PATHWAY_COMPLETE_XP);

    if (isGuest) {
      const award = awardGuestXp(PATHWAY_COMPLETE_XP, "pathway_complete");
      if (award.leveledUp) fireLevelUp(award.newLevelTitle);
      return;
    }

    // Logged-in: persist completion, which credits all step XP + the bonus
    // server-side, saves the pathway card, and awards Pathway Pioneer.
    setSaving(true);
    try {
      const res = await fetch("/api/pathway/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathwayId: pathway.id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.leveledUp) fireLevelUp(data.newLevelTitle);
        for (const badge of data.awardedBadges ?? []) fireBadgeEarned(badge);
      }
    } catch {
      /* non-fatal — the chain is still shown */
    } finally {
      setSaving(false);
    }
  }

  // ---- Completed view ------------------------------------------------------
  if (phase === "complete") {
    return (
      <motion.div
        className="card-soft p-6 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-4xl">🧭</div>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">
          Pathway complete!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {pathway.startCompound} → {pathway.endCompound}
        </p>

        <div className="mt-5 flex justify-center overflow-x-auto pb-2">
          <PathwayChain steps={steps} />
        </div>

        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold text-primary-border">
          <Zap className="h-4 w-4" aria-hidden /> +{xpEarned} XP{" "}
          <span className="text-xs font-medium text-muted-foreground">
            (incl. +{PATHWAY_COMPLETE_XP} bonus)
          </span>
        </p>

        {isGuest && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sign up to keep this pathway card and earn the Pathway Pioneer badge.
          </p>
        )}
        {saving && (
          <p className="mt-3 text-xs text-muted-foreground">Saving…</p>
        )}

        <Button type="button" onClick={onExit} className="mt-6">
          Choose another pathway
        </Button>
      </motion.div>
    );
  }

  // ---- Playing view --------------------------------------------------------
  const fromCompound = steps[currentStep].compoundName;

  return (
    <div className="card-soft p-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold">
          Step {currentStep + 1} of {steps.length - 1}
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-primary">
          <Zap className="h-3.5 w-3.5" aria-hidden /> +{PATHWAY_STEP_XP} XP
        </span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Goal: convert{" "}
        <span className="font-bold text-foreground">
          {pathway.startCompound}
        </span>{" "}
        →{" "}
        <span className="font-bold text-foreground">
          {pathway.endCompound}
        </span>
      </p>

      <h2 className="mt-4 text-lg font-extrabold tracking-tight">
        What is <span className="text-primary">{fromCompound}</span> converted to
        {target?.reagentUsed ? (
          <>
            {" "}
            using{" "}
            <span
              className="rounded-md px-1.5 py-0.5 text-base"
              style={{
                color: reactionColorVar(target.reactionTypeColor),
                backgroundColor: `color-mix(in srgb, ${reactionColorVar(
                  target.reactionTypeColor
                )} 14%, transparent)`,
              }}
            >
              {target.reagentUsed}
            </span>
          </>
        ) : null}
        ?
      </h2>

      <div className="mt-5 grid gap-2.5">
        {options.map((opt) => {
          const isWrong = wrongKey === opt;
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => handlePick(opt)}
              animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex h-12 items-center rounded-2xl border-2 px-4 text-left text-sm font-semibold transition-all ${
                isWrong
                  ? "border-destructive bg-destructive-soft text-destructive-border"
                  : "border-border bg-card hover:-translate-y-px hover:border-primary hover:bg-primary-soft/40"
              }`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Live chain built so far. */}
      <div className="mt-6 overflow-x-auto border-t border-border pt-4">
        <p className="mb-2 text-xs font-bold text-muted-foreground">
          Your pathway
        </p>
        <AnimatePresence>
          <PathwayChain steps={steps} revealed={currentStep + 1} />
        </AnimatePresence>
      </div>
    </div>
  );
}
