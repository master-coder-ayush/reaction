"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnswerOption, type AnswerState } from "@/components/AnswerOption";
import { EscapeRoomDoorMap } from "@/components/EscapeRoomDoorMap";
import { Confetti } from "@/components/Confetti";
import { reactionColorVar } from "@/lib/constants";
import { fireLevelUp } from "@/components/LevelUpToast";
import { fireBadgeEarned } from "@/lib/badge-client";
import { awardGuestXp } from "@/lib/guest";
import {
  ESCAPE_CLUE_COST,
  ESCAPE_XP_AWARD,
  formatTime,
  type EscapeDoor,
} from "@/lib/escape";
import type { ReactionOptionDTO } from "@/app/api/reactions/route";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const BUILD_PRIORITY = ["reagent", "product", "reactant"] as const;
const TYPE_LABEL: Record<string, string> = {
  reagent: "Pick the correct reagent",
  product: "Pick the correct product",
  reactant: "Pick the correct reactant",
  name: "Name this reaction",
};

type Props = {
  classLevel: "11" | "12";
  doors: EscapeDoor[];
  isGuest: boolean;
};

/**
 * Escape Room orchestrator (Sprint 5 §5.4). Walk each door's reactions in
 * sequence: a correct answer unlocks that slot and advances; a wrong answer just
 * resets the reaction (no penalty, retry until correct). A clue reveals the
 * reaction's why_text for 10 XP. Clearing all reactions in a door opens it and
 * moves to the next. Escaping all doors saves the elapsed time + awards the
 * Escape Artist badge.
 */
export function EscapeRoomSession({ classLevel, doors, isGuest }: Props) {
  const [doorIndex, setDoorIndex] = useState(0);
  const [reactionIndex, setReactionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const cluesUsedRef = useRef(0);

  const [escaped, setEscaped] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [awardedXp, setAwardedXp] = useState(0);
  // Latest elapsed seconds, mirrored into a ref so completion handlers can read
  // the final time without depending on render timing.
  const elapsedRef = useRef(0);

  // Elapsed-time clock, running until escape. Start time is captured on mount
  // (inside the effect, never during render) so the timer is stable.
  useEffect(() => {
    const startMs = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - startMs) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 500);
    return () => clearInterval(id);
  }, []);

  const door = doors[doorIndex];
  const reaction = door?.reactions[reactionIndex];

  function optionsFor(r: typeof reaction) {
    if (!r) return { options: [] as ReactionOptionDTO[], type: "name" };
    if (r.mode === "name") {
      return {
        options: r.options
          .filter((o) => o.optionType === "name")
          .sort((a, b) => a.displayOrder - b.displayOrder),
        type: "name",
      };
    }
    const type =
      BUILD_PRIORITY.find((t) => r.options.some((o) => o.optionType === t)) ??
      "reagent";
    return {
      options: r.options
        .filter((o) => o.optionType === type)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      type,
    };
  }

  const { options, type } = optionsFor(reaction);

  async function complete() {
    const seconds = elapsedRef.current;
    setFinalTime(seconds);
    setEscaped(true);

    const netXp = Math.max(0, ESCAPE_XP_AWARD - cluesUsedRef.current * ESCAPE_CLUE_COST);
    setAwardedXp(netXp);

    if (isGuest) {
      if (netXp > 0) {
        const award = awardGuestXp(netXp, "escape_completed");
        if (award.leveledUp) fireLevelUp(award.newLevelTitle);
      }
      return;
    }

    try {
      const res = await fetch("/api/escape-room/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel,
          seconds,
          cluesUsed: cluesUsedRef.current,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.leveledUp) fireLevelUp(data.newLevelTitle);
        for (const badge of data.awardedBadges ?? []) fireBadgeEarned(badge);
      }
    } catch {
      /* non-fatal — escape still shown locally */
    }
  }

  function advance() {
    setSelectedId(null);
    setWrong(false);
    setShowClue(false);

    // Next reaction in this door?
    if (reactionIndex + 1 < door.reactions.length) {
      setReactionIndex((i) => i + 1);
      return;
    }
    // Door cleared — next door, or escape.
    if (doorIndex + 1 < doors.length) {
      setDoorIndex((d) => d + 1);
      setReactionIndex(0);
      return;
    }
    void complete();
  }

  function handleSubmit() {
    if (selectedId == null) return;
    const chosen = options.find((o) => o.id === selectedId);
    if (chosen?.isCorrect) {
      advance();
    } else {
      // Wrong → reset the reaction (no penalty, try again).
      setWrong(true);
      setSelectedId(null);
    }
  }

  function useClue() {
    if (showClue) return;
    // The clue cost (10 XP each) is netted out of the +100 escape award at
    // completion, for both guests and logged-in users — see complete().
    cluesUsedRef.current += 1;
    setShowClue(true);
  }

  if (escaped) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <Confetti />
        <div className="text-4xl">🎉</div>
        <h2 className="mt-3 text-2xl font-bold">You escaped!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Time:{" "}
          <span className="font-mono font-semibold text-foreground">
            {formatTime(finalTime)}
          </span>
        </p>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-1.5 text-sm font-bold text-success">
          +{awardedXp} XP · 🗝️ Escape Artist badge earned
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            See the Escape Room leaderboard →
          </Link>
          <Link
            href="/learn"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Chapter Map
          </Link>
        </div>
      </div>
    );
  }

  if (!door || !reaction) return null;

  const accent = reactionColorVar(reaction.reactionTypeColor);
  const isNameMode = type === "name";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">
          Door {doorIndex + 1} · {door.name}
        </span>
        <span className="rounded-lg bg-muted px-2.5 py-1 font-mono text-sm font-bold tabular-nums">
          ⏱ {formatTime(elapsed)}
        </span>
      </div>

      <EscapeRoomDoorMap
        doorNames={doors.map((d) => d.name)}
        currentIndex={doorIndex}
        clearedCount={doorIndex}
      />

      {/* Keyhole / reaction-slot progress within this door. */}
      <div className="mt-4 flex justify-center gap-2">
        {door.reactions.map((_, i) => (
          <span
            key={i}
            className={
              "h-2.5 w-2.5 rounded-full " +
              (i < reactionIndex
                ? "bg-success"
                : i === reactionIndex
                  ? "bg-primary"
                  : "bg-muted")
            }
            aria-hidden
          />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between text-xs">
          <span className="tabular-nums text-muted-foreground">
            Reaction {reactionIndex + 1} / {door.reactions.length}
          </span>
          <span
            className="rounded-full px-2 py-0.5 font-medium text-white"
            style={{ backgroundColor: accent }}
          >
            {reaction.reactionTypeName}
          </span>
        </div>

        {isNameMode ? (
          <p className="mt-3 text-sm text-muted-foreground">{reaction.questionText}</p>
        ) : (
          <>
            <h2 className="mt-3 text-lg font-semibold">{reaction.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{reaction.questionText}</p>
          </>
        )}

        {reaction.equationText && (
          <p
            className={
              "mt-3 rounded-lg bg-muted px-3 py-2 text-center font-mono " +
              (isNameMode ? "text-lg font-semibold" : "text-base")
            }
          >
            {reaction.equationText}
          </p>
        )}

        <p className="mt-4 text-sm font-medium">
          {TYPE_LABEL[type] ?? "Choose the correct option"}
        </p>

        <div className="mt-3 space-y-2.5">
          {options.map((o, i) => (
            <AnswerOption
              key={o.id}
              text={o.text}
              letter={LETTERS[i]}
              state={(o.id === selectedId ? "selected" : "idle") as AnswerState}
              disabled={false}
              onSelect={() => {
                setSelectedId(o.id);
                setWrong(false);
              }}
            />
          ))}
        </div>

        {wrong && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            ✗ Not the key. The door stays shut — try again.
          </p>
        )}

        {showClue && reaction.whyText && (
          <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-foreground">
            💡 {reaction.whyText}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={useClue}
            disabled={showClue || !reaction.whyText}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Need a clue (−{ESCAPE_CLUE_COST} XP)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedId == null}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Try the key 🔑
          </button>
        </div>
      </div>
    </div>
  );
}
