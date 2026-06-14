"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Flag, Trophy } from "lucide-react";
import { TimerBar } from "@/components/TimerBar";
import { Button } from "@/components/ui/button";
import { fireLevelUp } from "@/components/LevelUpToast";
import { fireBadgeEarned } from "@/lib/badge-client";
import { awardGuestXp } from "@/lib/guest";
import { reactionColorVar } from "@/lib/constants";
import { XP_AWARDS } from "@/lib/xp";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";

// ---------------------------------------------------------------------------
// TimedSession (Sprint 7 §7.2). 60-second burst mode. After a 3-2-1 countdown,
// reactions appear one at a time in Module 1/2 format. A correct tap advances
// instantly; a wrong tap flashes red and keeps the same reaction. The timer runs
// to zero regardless. End screen shows N correct, N×15 XP, previous best, and
// fires the Speed Demon badge (logged-in) via /api/timed/submit.
// ---------------------------------------------------------------------------

const DURATION = 60; // seconds
const MAX_QUESTIONS = 20;
const TYPE_PRIORITY = ["name", "reagent", "product", "reactant"] as const;

type Phase = "idle" | "countdown" | "running" | "done";

function pickType(opts: ReactionOptionDTO[]): string {
  for (const t of TYPE_PRIORITY) if (opts.some((o) => o.optionType === t)) return t;
  return opts[0]?.optionType ?? "reagent";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PROMPT: Record<string, string> = {
  name: "Name this reaction",
  reagent: "Pick the correct reagent",
  product: "Pick the correct product",
  reactant: "Pick the correct reactant",
};

export function TimedSession({
  reactions,
  isGuest,
  initialBest,
}: {
  reactions: ReactionDTO[];
  isGuest: boolean;
  initialBest: number | null;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [remaining, setRemaining] = useState(DURATION);
  const [order, setOrder] = useState<number[]>([]);
  // Pre-shuffled options per question index, keyed by playable[] index.
  // Computed once at start so the timer re-renders don't reshuffle them.
  const [shuffledOptions, setShuffledOptions] = useState<Map<number, ReactionOptionDTO[]>>(new Map());
  const [pos, setPos] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);

  // End-screen result.
  const [best, setBest] = useState<number | null>(initialBest);
  const [awardedXp, setAwardedXp] = useState(0);
  const submittedRef = useRef(false);

  const playable = useMemo(
    () => reactions.filter((r) => r.options.length >= 2),
    [reactions]
  );

  const start = useCallback(() => {
    const newOrder = shuffle(playable.map((_, i) => i));
    setOrder(newOrder);
    // Pre-shuffle options for every question so re-renders from the timer
    // don't reshuffle them mid-display.
    const optMap = new Map<number, ReactionOptionDTO[]>();
    for (const idx of newOrder) {
      const r = playable[idx];
      const qType = pickType(r.options);
      optMap.set(idx, shuffle(r.options.filter((o) => o.optionType === qType)));
    }
    setShuffledOptions(optMap);
    setPos(0);
    setCorrectCount(0);
    setRemaining(DURATION);
    setWrongId(null);
    setAwardedXp(0);
    submittedRef.current = false;
    setCountdown(3);
    setPhase("countdown");
  }, [playable]);

  // Countdown 3-2-1.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      // Driving the countdown is the whole point of this effect (a timer), so the
      // state transition here is intentional, not a derived-state mistake.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("running");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // 60-second timer.
  useEffect(() => {
    if (phase !== "running") return;
    if (remaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 0.1)), 100);
    return () => clearTimeout(t);
  }, [phase, remaining]);

  // Submit score once when the run ends.
  const finalizeRun = useCallback(
    async (score: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const xp = score * XP_AWARDS.TIMED_PER_CORRECT;
      setAwardedXp(xp);

      if (isGuest) {
        if (xp > 0) {
          const a = awardGuestXp(xp, "timed_challenge");
          if (a.leveledUp) fireLevelUp(a.newLevelTitle);
        }
        setBest((b) => (b == null ? score : Math.max(b, score)));
        return;
      }

      try {
        const res = await fetch("/api/timed/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
        });
        const data = await res.json();
        if (res.ok) {
          setAwardedXp(data.awardedXp ?? xp);
          setBest(data.best ?? score);
          if (data.leveledUp) fireLevelUp(data.newLevelTitle);
          for (const b of data.awardedBadges ?? []) fireBadgeEarned(b);
        }
      } catch {
        /* non-fatal — local score still shown */
      }
    },
    [isGuest]
  );

  useEffect(() => {
    // On run end, submit the score once (guards with submittedRef). The state
    // updates happen async inside finalizeRun, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (phase === "done") void finalizeRun(correctCount);
  }, [phase, correctCount, finalizeRun]);

  // --- Idle / entry --------------------------------------------------------
  if (phase === "idle") {
    return (
      <div className="card-soft p-8 text-center">
        <span className="icon-chip mx-auto bg-warn-soft text-warn-border" aria-hidden>
          <Zap className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">
          60-Second Challenge
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How many reactions can you name in 60 seconds?
        </p>
        {best != null && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-sm font-bold text-warn-border">
            <Trophy className="h-4 w-4" aria-hidden /> Your best: {best}
          </p>
        )}
        {playable.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No reactions available to play yet.
          </p>
        ) : (
          <Button type="button" variant="warn" size="lg" onClick={start} className="mt-6 px-8">
            Start
          </Button>
        )}
      </div>
    );
  }

  // --- Countdown -----------------------------------------------------------
  if (phase === "countdown") {
    return (
      <div className="card-soft flex h-64 items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={countdown}
            className="text-7xl font-black text-warn"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {countdown === 0 ? "Go!" : countdown}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  }

  // --- Done / end screen ---------------------------------------------------
  if (phase === "done") {
    const isNewBest = best != null && correctCount >= best && correctCount > 0;
    return (
      <div className="card-soft p-8 text-center">
        <span className="icon-chip mx-auto bg-warn-soft text-warn-border" aria-hidden>
          <Flag className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-xl font-extrabold tracking-tight">Time&apos;s up!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You answered{" "}
          <span className="font-bold text-foreground">{correctCount}</span>{" "}
          reaction{correctCount === 1 ? "" : "s"} correctly in 60 seconds!
        </p>

        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-warn-soft px-4 py-1.5 text-sm font-bold text-warn-border">
          <Zap className="h-4 w-4" aria-hidden /> +{awardedXp} XP
        </p>

        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {isNewBest ? "New best!" : `Your best: ${best ?? correctCount}`}
        </p>

        {isGuest && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sign up to save your score to the Speed leaderboard.
          </p>
        )}

        <Button type="button" variant="warn" onClick={start} className="mt-6">
          Play again
        </Button>
      </div>
    );
  }

  // --- Running -------------------------------------------------------------
  const reactionIdx = order[pos];
  const reaction = playable[reactionIdx];
  const qType = pickType(reaction.options);
  const isName = qType === "name";
  // Use pre-shuffled options — computed once at start, stable across timer re-renders.
  const options = shuffledOptions.get(reactionIdx) ?? shuffle(reaction.options.filter((o) => o.optionType === qType));
  const accent = reactionColorVar(reaction.reactionTypeColor);

  function handlePick(o: ReactionOptionDTO) {
    if (o.isCorrect) {
      const nextPos = pos + 1;
      setCorrectCount((c) => c + 1);
      setWrongId(null);
      if (nextPos >= order.length || nextPos >= MAX_QUESTIONS) {
        setPhase("done");
      } else {
        setPos(nextPos);
      }
    } else {
      setWrongId(o.id);
      window.setTimeout(() => setWrongId((w) => (w === o.id ? null : w)), 350);
    }
  }

  return (
    <div>
      <TimerBar remaining={remaining} total={DURATION} />

      <div className="card-soft mt-4 p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-bold text-warn-border">
            <Zap className="h-3.5 w-3.5" aria-hidden /> {correctCount} / {Math.min(order.length, MAX_QUESTIONS)} correct
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {reaction.reactionTypeName}
          </span>
        </div>

        {!isName && <h2 className="mt-3 text-base font-extrabold tracking-tight">{reaction.name}</h2>}
        <p className="mt-1 text-sm text-muted-foreground">
          {reaction.questionText}
        </p>
        {reaction.equationText && (
          <p className="mt-3 rounded-xl border border-border bg-muted px-3 py-2 text-center font-mono text-sm font-semibold">
            {reaction.equationText}
          </p>
        )}

        <p className="mt-4 text-sm font-bold">{PROMPT[qType] ?? "Choose"}</p>
        <div className="mt-3 grid gap-2.5">
          {options.map((o) => (
            <motion.button
              key={o.id}
              type="button"
              onClick={() => handlePick(o)}
              animate={wrongId === o.id ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={
                "flex h-12 items-center rounded-2xl border-2 px-4 text-left text-sm font-semibold transition-all " +
                (wrongId === o.id
                  ? "border-destructive bg-destructive-soft text-destructive-border"
                  : "border-border bg-card hover:-translate-y-px hover:border-warn hover:bg-warn-soft/40")
              }
            >
              {o.text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
