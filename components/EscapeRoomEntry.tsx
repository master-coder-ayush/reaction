"use client";

import { useState } from "react";
import { EscapeRoomSession } from "@/components/EscapeRoomSession";
import { EscapeRoomDoorMap } from "@/components/EscapeRoomDoorMap";
import { ESCAPE_CLUE_COST, type EscapeDoor } from "@/lib/escape";

// Escape Room entry (Sprint 5 §5.4): the lab intro, class selector, and door
// preview, then hands off to <EscapeRoomSession> on start.

type Props = {
  doorsByClass: { "11": EscapeDoor[]; "12": EscapeDoor[] };
  isGuest: boolean;
};

export function EscapeRoomEntry({ doorsByClass, isGuest }: Props) {
  const [classLevel, setClassLevel] = useState<"11" | "12">("11");
  const [started, setStarted] = useState(false);

  const doors = doorsByClass[classLevel];

  if (started && doors.length > 0) {
    return (
      <EscapeRoomSession
        key={classLevel}
        classLevel={classLevel}
        doors={doors}
        isGuest={isGuest}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="text-4xl">🧪🔒</div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">Escape Room</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are locked in the Organic Chemistry Lab. Solve reactions to unlock
        each door and escape.
      </p>

      {/* Class selector */}
      <div className="mt-5 inline-flex rounded-lg border border-border bg-background p-1">
        {(["11", "12"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setClassLevel(c)}
            className={
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors " +
              (classLevel === c
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            Class {c}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <EscapeRoomDoorMap
          doorNames={
            doors.length > 0
              ? doors.map((d) => d.name)
              : ["Door 1", "Door 2", "Door 3", "Door 4", "Door 5"]
          }
          currentIndex={0}
          clearedCount={0}
        />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Wrong answers just reset the reaction — no penalty. A clue costs{" "}
        {ESCAPE_CLUE_COST} XP. Escape all {doors.length || 5} doors to earn the
        Escape Artist badge.
      </p>

      {doors.length === 0 ? (
        <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          No reactions are available for Class {classLevel} yet.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Enter the Lab →
        </button>
      )}
    </div>
  );
}
