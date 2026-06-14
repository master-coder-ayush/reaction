// Client-safe escape room constants, types, and utilities.
// No DB imports — safe to import from "use client" components.
import type { ReactionDTO } from "@/app/api/reactions/route";

export const ESCAPE_DOOR_COUNT = 5;
export const ESCAPE_REACTIONS_PER_DOOR = 5;
export const ESCAPE_CLUE_COST = 10;
export const ESCAPE_XP_AWARD = 100;

export type EscapeReaction = ReactionDTO & { mode: "build" | "name" };

export type EscapeDoor = {
  chapter: number;
  name: string;
  reactions: EscapeReaction[];
};

export function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
