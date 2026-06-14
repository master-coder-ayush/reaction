"use client";

import { DoorOpen, Unlock, Lock } from "lucide-react";

// Escape Room door map (Sprint 5 §5.4). Shows the 5 doors horizontally. The
// current door is highlighted; cleared doors show open, future doors padlocked.

export type DoorState = "open" | "current" | "locked";

export function EscapeRoomDoorMap({
  doorNames,
  currentIndex,
  clearedCount,
}: {
  doorNames: string[];
  currentIndex: number;
  clearedCount: number;
}) {
  return (
    <div className="flex items-stretch justify-center gap-2 sm:gap-3">
      {doorNames.map((name, i) => {
        const state: DoorState =
          i < clearedCount ? "open" : i === currentIndex ? "current" : "locked";
        return (
          <div
            key={i}
            className={
              "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition-colors " +
              (state === "open"
                ? "border-primary bg-primary-soft text-primary-border"
                : state === "current"
                  ? "border-accent bg-accent-soft text-accent-border"
                  : "border-border bg-muted/40 text-muted-foreground opacity-70")
            }
          >
            <span aria-hidden>
              {state === "open" ? (
                <DoorOpen className="h-6 w-6" />
              ) : state === "current" ? (
                <Unlock className="h-6 w-6" />
              ) : (
                <Lock className="h-6 w-6" />
              )}
            </span>
            <span className="text-[10px] font-bold leading-tight text-muted-foreground">
              Door {i + 1}
            </span>
            <span className="line-clamp-1 text-[10px] font-semibold leading-tight">{name}</span>
          </div>
        );
      })}
    </div>
  );
}
