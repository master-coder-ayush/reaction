"use client";

import {
  GUEST_XP_KEY,
  GUEST_PROGRESS_KEY,
  GUEST_XP_LOG_KEY,
} from "@/lib/constants";
import { applyXp, type AwardResult } from "@/lib/xp";

// ---------------------------------------------------------------------------
// Guest session helpers (client-only). Guests never hit the DB — their XP,
// XP log, and attempted-reaction list live entirely in localStorage and are
// migrated to the account on sign-up (see app/api/signup/route.ts).
// ---------------------------------------------------------------------------

export type GuestXpLogEntry = {
  amount: number;
  action: string;
  at: string; // ISO timestamp
};

function safeNumber(raw: string | null): number {
  const n = Number(raw ?? "0");
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function readGuestXp(): number {
  if (typeof window === "undefined") return 0;
  try {
    return safeNumber(window.localStorage.getItem(GUEST_XP_KEY));
  } catch {
    return 0;
  }
}

export function readGuestXpLog(): GuestXpLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_XP_LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is GuestXpLogEntry =>
        !!e &&
        typeof e === "object" &&
        typeof (e as GuestXpLogEntry).amount === "number"
    );
  } catch {
    return [];
  }
}

export function readGuestProgress(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_PROGRESS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is number => typeof n === "number" && Number.isInteger(n)
    );
  } catch {
    return [];
  }
}

/**
 * Award XP to the guest session: bump `guest_xp`, append to `guest_xp_log[]`,
 * and dispatch a `guest-xp-change` event so the nav counter updates live.
 * Returns the same {@link AwardResult} shape as the server path so callers can
 * fire the level-up animation identically for guests and logged-in users.
 */
export function awardGuestXp(amount: number, action: string): AwardResult {
  const current = readGuestXp();
  const result = applyXp(current, amount);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(GUEST_XP_KEY, String(result.newXp));
      const log = readGuestXpLog();
      log.push({ amount: result.awarded, action, at: new Date().toISOString() });
      window.localStorage.setItem(GUEST_XP_LOG_KEY, JSON.stringify(log));
      window.dispatchEvent(
        new CustomEvent("guest-xp-change", { detail: { xp: result.newXp } })
      );
    } catch {
      /* ignore quota / availability errors */
    }
  }

  return result;
}

/** Record a guest-attempted reaction id (deduped) so it migrates on sign-up. */
export function recordGuestAttempt(reactionId: number): void {
  if (typeof window === "undefined") return;
  try {
    const ids = new Set(readGuestProgress());
    ids.add(reactionId);
    window.localStorage.setItem(
      GUEST_PROGRESS_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    /* ignore */
  }
}
