"use client";

import { useDroppable } from "@dnd-kit/core";

// ---------------------------------------------------------------------------
// LabelSlot (Sprint 7 §7.1). A drop target on the mechanism diagram, placed
// absolutely by its 0-100 % position. Highlights on drag-over. When tap-to-place
// is armed (a tray label is selected), tapping the slot places it. Shows the
// placed label; flashes red when a wrong placement is revealed on submit.
// ---------------------------------------------------------------------------

export function LabelSlot({
  slotKey,
  posX,
  posY,
  placedLabel,
  state,
  onTap,
}: {
  slotKey: string;
  posX: number;
  posY: number;
  placedLabel: string | null;
  // idle while playing; correct/wrong after a submit reveal.
  state: "idle" | "correct" | "wrong";
  onTap: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${slotKey}` });

  const border =
    state === "correct"
      ? "border-primary bg-primary-soft text-primary-border"
      : state === "wrong"
        ? "animate-pulse border-destructive bg-destructive-soft text-destructive-border"
        : isOver
          ? "border-secondary bg-secondary-soft"
          : placedLabel
            ? "border-secondary/60 bg-secondary-soft/50"
            : "border-dashed border-muted-foreground/50 bg-card/80";

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={
        "absolute flex min-h-9 min-w-24 items-center justify-center rounded-xl border-2 px-2 py-1 text-center text-xs font-bold transition-colors " +
        border
      }
    >
      {placedLabel ?? (
        <span className="text-muted-foreground">Drop here</span>
      )}
    </button>
  );
}
