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
      ? "border-success bg-success/10 text-success"
      : state === "wrong"
        ? "animate-pulse border-destructive bg-destructive/10 text-destructive"
        : isOver
          ? "border-primary bg-primary/15"
          : placedLabel
            ? "border-primary/60 bg-primary/5"
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
        "absolute flex min-h-9 min-w-24 items-center justify-center rounded-lg border-2 px-2 py-1 text-center text-xs font-semibold transition-colors " +
        border
      }
    >
      {placedLabel ?? (
        <span className="text-muted-foreground">Drop here</span>
      )}
    </button>
  );
}
