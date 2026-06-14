"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { readGuestXp } from "@/lib/guest";

/**
 * Session XP counter shown in the nav (Sprint 2 §2.2/§2.3). For guests it reads
 * `guest_xp` from localStorage and updates live on the `guest-xp-change` event.
 * For logged-in users the server passes their stored XP via `initialXp`.
 */
export function SessionXpCounter({
  isGuest,
  initialXp = 0,
}: {
  isGuest: boolean;
  initialXp?: number;
}) {
  const [xp, setXp] = useState(initialXp);

  // Guest XP lives only in localStorage — read it after mount to avoid a
  // hydration mismatch, then subscribe to live changes.
  useEffect(() => {
    if (!isGuest) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setXp(readGuestXp());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ xp: number }>).detail;
      if (detail && typeof detail.xp === "number") setXp(detail.xp);
    };
    window.addEventListener("guest-xp-change", onChange);
    return () => window.removeEventListener("guest-xp-change", onChange);
  }, [isGuest]);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-sm font-extrabold text-primary-border">
      <Zap className="h-3.5 w-3.5 fill-current" aria-hidden />
      <span className="tabular-nums">{xp}</span>
      <span className="text-primary-border/70">XP</span>
    </span>
  );
}
