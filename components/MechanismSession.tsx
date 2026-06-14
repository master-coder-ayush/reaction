"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import { MechanismDiagram } from "@/components/MechanismDiagram";
import { DraggableLabel } from "@/components/DraggableLabel";
import { Button } from "@/components/ui/button";
import { fireLevelUp } from "@/components/LevelUpToast";
import { awardGuestXp, recordGuestResult } from "@/lib/guest";
import { fireBadgeEarned, reportBadgeEvents } from "@/lib/badge-client";
import { reactionColorVar } from "@/lib/constants";
import type { MechanismDTO } from "@/lib/mechanism";

// ---------------------------------------------------------------------------
// MechanismSession (Sprint 7 §7.1). Plays one drag-and-drop mechanism: drag (or
// tap-to-select then tap-slot) labels from the tray into the diagram's slots,
// then Submit. All correct → confetti + 30 XP + story. Any wrong → wrong slots
// flash red and those labels snap back to the tray; retry. After 3 failed
// attempts the answer is revealed (no XP). Pure client-side evaluation; pass/
// fail is posted to /api/progress for logged-in users.
// ---------------------------------------------------------------------------

const MECH_XP = 30;
const MAX_ATTEMPTS = 3;

// Stable per-label id for dnd (text may repeat across mechanisms but not within).
function labelId(text: string, i: number) {
  return `label:${i}:${text}`;
}

export function MechanismSession({
  mechanism,
  isGuest,
  onNext,
  hasNext,
}: {
  mechanism: MechanismDTO;
  isGuest: boolean;
  onNext: () => void;
  hasNext: boolean;
}) {
  // slotKey -> label text (or null). Tray = labels not currently placed.
  const [placed, setPlaced] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(mechanism.slots.map((s) => [s.slotKey, null]))
  );
  const [selected, setSelected] = useState<string | null>(null); // tap-to-place
  const [revealState, setRevealState] = useState<Record<string, "correct" | "wrong">>(
    {}
  );
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<"playing" | "solved" | "revealed">(
    "playing"
  );
  const [activeDrag, setActiveDrag] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  const labelEntries = useMemo(
    () => mechanism.labels.map((text, i) => ({ id: labelId(text, i), text })),
    [mechanism.labels]
  );

  const placedTexts = useMemo(
    () => new Set(Object.values(placed).filter((v): v is string => v != null)),
    [placed]
  );

  const allFilled = mechanism.slots.every((s) => placed[s.slotKey] != null);
  const accent = reactionColorVar(null);

  function placeLabel(slotKey: string, text: string) {
    setPlaced((prev) => {
      const next = { ...prev };
      // Remove this text from any slot it currently occupies (one place each).
      for (const k of Object.keys(next)) {
        if (next[k] === text) next[k] = null;
      }
      next[slotKey] = text;
      return next;
    });
    setSelected(null);
    setRevealState({});
  }

  function clearSlot(slotKey: string) {
    setPlaced((prev) => ({ ...prev, [slotKey]: null }));
    setRevealState({});
  }

  // --- Tap-to-place (mobile fallback) -------------------------------------
  function handleSlotTap(slotKey: string) {
    if (phase !== "playing") return;
    if (selected) {
      placeLabel(slotKey, selected);
    } else if (placed[slotKey]) {
      // Tapping a filled slot with nothing selected returns its label to tray.
      clearSlot(slotKey);
    }
  }

  // --- dnd-kit drag --------------------------------------------------------
  function handleDragStart(e: DragStartEvent) {
    const text = labelEntries.find((l) => l.id === e.active.id)?.text;
    setActiveDrag(text ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDrag(null);
    const overId = e.over?.id;
    const text = labelEntries.find((l) => l.id === e.active.id)?.text;
    if (!text || typeof overId !== "string" || !overId.startsWith("slot:")) {
      return;
    }
    placeLabel(overId.slice("slot:".length), text);
  }

  function slotState(slotKey: string): "idle" | "correct" | "wrong" {
    return revealState[slotKey] ?? "idle";
  }

  async function recordResult(passed: boolean) {
    if (isGuest) {
      if (mechanism.reactionId) recordGuestResult(mechanism.reactionId, passed);
      return;
    }
    if (mechanism.reactionId == null) return;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reactionId: mechanism.reactionId,
          correct: passed,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.awardedBadges)) {
        for (const b of data.awardedBadges) fireBadgeEarned(b);
      }
      if (res.ok && data.newlyMastered) {
        void reportBadgeEvents(["CARDS_25", "CARDS_ALL"]);
      }
    } catch {
      /* non-fatal */
    }
    if (passed) void reportBadgeEvents(["FIRST_REACTION"]);
  }

  function awardXp() {
    if (isGuest) {
      const a = awardGuestXp(MECH_XP, "module_3_correct");
      if (a.leveledUp) fireLevelUp(a.newLevelTitle);
    } else {
      fetch("/api/xp/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: MECH_XP, action: "module_3_correct" }),
      })
        .then((r) => r.json())
        .then((d) => d?.leveledUp && fireLevelUp(d.newLevelTitle))
        .catch(() => {});
    }
  }

  function handleSubmit() {
    if (!allFilled || phase !== "playing") return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const reveal: Record<string, "correct" | "wrong"> = {};
    let allCorrect = true;
    for (const s of mechanism.slots) {
      const ok = placed[s.slotKey] === s.correctLabel;
      reveal[s.slotKey] = ok ? "correct" : "wrong";
      if (!ok) allCorrect = false;
    }
    setRevealState(reveal);

    if (allCorrect) {
      setPhase("solved");
      awardXp();
      void recordResult(true);
      return;
    }

    // Wrong: snap the wrong labels back to the tray; keep correct ones.
    setPlaced((prev) => {
      const next = { ...prev };
      for (const s of mechanism.slots) {
        if (reveal[s.slotKey] === "wrong") next[s.slotKey] = null;
      }
      return next;
    });

    if (nextAttempts >= MAX_ATTEMPTS) {
      // Reveal the full correct answer (no XP).
      setPhase("revealed");
      setPlaced(
        Object.fromEntries(
          mechanism.slots.map((s) => [s.slotKey, s.correctLabel])
        )
      );
      setRevealState(
        Object.fromEntries(mechanism.slots.map((s) => [s.slotKey, "correct"]))
      );
      void recordResult(false);
    }
  }

  const solved = phase === "solved";
  const revealed = phase === "revealed";

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="card-soft relative overflow-hidden p-5">
        {solved && <Confetti />}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{mechanism.name}</span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {mechanism.mechanismType}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold">How to play:</span> Tap a label to
          select it (it turns blue), then tap the dashed slot where it belongs.
          On desktop you can also drag &amp; drop. Fill all slots, then hit Submit.
        </p>

        <div className="mt-4">
          <MechanismDiagram
            diagramText={mechanism.diagramText}
            slots={mechanism.slots}
            placedBySlot={placed}
            slotState={slotState}
            onSlotTap={handleSlotTap}
          />
        </div>

        {/* Tray */}
        {phase === "playing" && (
          <>
            <p className="mt-4 text-xs font-bold text-muted-foreground">
              {selected
                ? `"${selected}" selected — now tap a dashed slot to place it`
                : `Labels (${labelEntries.length - placedTexts.size} remaining) — tap one to select`}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {labelEntries.map((l) => (
                <DraggableLabel
                  key={l.id}
                  id={l.id}
                  text={l.text}
                  selected={selected === l.text}
                  placed={placedTexts.has(l.text)}
                  onTap={() =>
                    setSelected((cur) => (cur === l.text ? null : l.text))
                  }
                />
              ))}
            </div>
          </>
        )}

        {phase === "playing" && (
          <>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!allFilled}
              className="mt-5 w-full"
            >
              Submit
            </Button>
            {attempts > 0 && (
              <p className="mt-2 text-center text-xs font-semibold text-destructive">
                Not quite — wrong labels returned to the tray.{" "}
                {MAX_ATTEMPTS - attempts} attempt
                {MAX_ATTEMPTS - attempts === 1 ? "" : "s"} left.
              </p>
            )}
          </>
        )}

        {(solved || revealed) && (
          <div className="mt-4">
            <div
              className={
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold " +
                (solved
                  ? "bg-primary-soft text-primary-border"
                  : "bg-muted text-muted-foreground")
              }
            >
              {solved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> All correct! +
                  {MECH_XP} XP
                </>
              ) : (
                "Here's the correct labelling."
              )}
            </div>
            {mechanism.storyText && (
              <p className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {mechanism.storyText}
              </p>
            )}
            <Button type="button" onClick={onNext} className="mt-4 w-full">
              {hasNext ? (
                <>
                  Next mechanism <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              ) : (
                "Done"
              )}
            </Button>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeDrag ? (
          <span className="rounded-full border-2 border-secondary bg-secondary-soft px-3 py-1.5 text-sm font-bold text-secondary-border shadow-soft-lg">
            {activeDrag}
          </span>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
