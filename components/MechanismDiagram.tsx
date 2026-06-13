"use client";

import { LabelSlot } from "@/components/LabelSlot";
import type { MechanismSlotDTO } from "@/lib/mechanism";

// ---------------------------------------------------------------------------
// MechanismDiagram (Sprint 7 §7.1). The canvas for a mechanism: shows the
// reaction structure (diagramText) and overlays the drop slots positioned by
// their 0-100 % coordinates. Slot interaction (drag / tap-place) is wired by the
// parent MechanismSession; this component is purely layout.
// ---------------------------------------------------------------------------

export function MechanismDiagram({
  diagramText,
  slots,
  placedBySlot,
  slotState,
  onSlotTap,
}: {
  diagramText: string;
  slots: MechanismSlotDTO[];
  placedBySlot: Record<string, string | null>;
  slotState: (slotKey: string) => "idle" | "correct" | "wrong";
  onSlotTap: (slotKey: string) => void;
}) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-background">
      {/* The reaction structure, centred. */}
      <div className="pointer-events-none absolute inset-x-0 top-6 text-center">
        <p className="px-4 font-mono text-base font-semibold tracking-wide">
          {diagramText}
        </p>
      </div>

      {slots.map((s) => (
        <LabelSlot
          key={s.slotKey}
          slotKey={s.slotKey}
          posX={s.posX}
          posY={s.posY}
          placedLabel={placedBySlot[s.slotKey] ?? null}
          state={slotState(s.slotKey)}
          onTap={() => onSlotTap(s.slotKey)}
        />
      ))}
    </div>
  );
}
