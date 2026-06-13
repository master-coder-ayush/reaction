"use client";

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
                ? "border-success bg-success/10"
                : state === "current"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/40 opacity-70")
            }
          >
            <span className="text-2xl" aria-hidden>
              {state === "open" ? "🚪" : state === "current" ? "🔓" : "🔒"}
            </span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">
              Door {i + 1}
            </span>
            <span className="line-clamp-1 text-[10px] leading-tight">{name}</span>
          </div>
        );
      })}
    </div>
  );
}
