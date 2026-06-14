// Client-safe boss constants and types — no DB imports.
import type { ReactionDTO } from "@/app/api/reactions/route";

export const BOSS_QUESTION_COUNT = 20;
export const BOSS_PASS_THRESHOLD = 16;
export const BOSS_TIME_SECONDS = 10 * 60;
export const BOSS_DAILY_ATTEMPT_LIMIT = 3;
export const BOSS_XP_AWARD = 200;

export type BossQuestion = ReactionDTO & { mode: "build" | "name" };
