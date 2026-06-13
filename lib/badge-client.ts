"use client";

import type { AwardedBadge } from "@/lib/badges";

// ---------------------------------------------------------------------------
// Client helper (Sprint 4 §4.3). Posts badge events to /api/badges/check and,
// for any newly-earned badge in the response, dispatches a global
// `badge-earned` CustomEvent so the mounted <BadgeRevealModal> can animate it.
// Guests never call this (badges require an account).
// ---------------------------------------------------------------------------

export async function reportBadgeEvents(events: string[]): Promise<void> {
  if (events.length === 0) return;
  try {
    const res = await fetch("/api/badges/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
    if (!res.ok) return;
    const data: { awarded?: AwardedBadge[] } = await res.json();
    for (const badge of data.awarded ?? []) {
      fireBadgeEarned(badge);
    }
  } catch {
    /* non-fatal — a missed badge can be re-checked on the next event */
  }
}

/** Fire the badge-reveal animation from any client component. */
export function fireBadgeEarned(badge: AwardedBadge) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("badge-earned", { detail: { badge } })
    );
  }
}
