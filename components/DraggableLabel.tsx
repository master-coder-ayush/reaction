"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// ---------------------------------------------------------------------------
// DraggableLabel (Sprint 7 §7.1). A tray chip the student drags onto a slot.
// Doubles as the tap-to-select control on mobile: tapping selects it (selected
// state), then tapping a slot places it (handled by the parent). dnd-kit's
// pointer drag handles the desktop case.
// ---------------------------------------------------------------------------

export function DraggableLabel({
  id,
  text,
  selected,
  onTap,
  placed = false,
}: {
  id: string;
  text: string;
  selected: boolean;
  onTap: () => void;
  /** Hidden from the tray once placed in a slot. */
  placed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled: placed });

  if (placed) return null;

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onTap}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
      }}
      {...listeners}
      {...attributes}
      className={
        "cursor-grab rounded-full border-2 bg-card px-3 py-1.5 text-sm font-medium shadow-sm transition-colors active:cursor-grabbing " +
        (selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/60")
      }
    >
      {text}
    </button>
  );
}
