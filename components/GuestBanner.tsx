"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Trophy, Link2, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { initGuestSession, guestExpiresInMs } from "@/lib/guest";

const COLLAPSED_KEY = "luc_guest_banner_collapsed";

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function GuestBanner() {
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    initGuestSession();
    setMsLeft(guestExpiresInMs());
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch { /* ignore */ }

    const id = setInterval(() => setMsLeft(guestExpiresInMs()), 1000);
    return () => clearInterval(id);
  }, []);

  if (msLeft === null) return null;

  const expired = msLeft === 0;
  const urgent = msLeft < 60 * 60 * 1000;

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try { window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  const accentColor = urgent ? "text-destructive" : "text-warn-border";
  const dotColor = urgent ? "bg-destructive" : "bg-warning";

  // Collapsed: just a floating pill at bottom-right
  if (collapsed) {
    return (
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-soft-lg text-xs font-bold hover:bg-muted transition-colors"
        aria-label="Show guest banner"
      >
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor} animate-pulse`} />
        <span className={accentColor}>
          {expired ? "Progress expired" : formatTimeLeft(msLeft)}
        </span>
        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {/* Countdown */}
        <AlertTriangle className={`h-4 w-4 shrink-0 ${accentColor}`} />
        <span className="text-xs font-bold">
          {expired ? (
            <span className="text-destructive">Your progress has expired.</span>
          ) : (
            <>
              <span className="text-muted-foreground">Progress lost in </span>
              <span className={`font-extrabold tabular-nums ${accentColor}`}>
                {formatTimeLeft(msLeft)}
              </span>
            </>
          )}
        </span>

        {/* Benefits */}
        <div className="hidden items-center gap-4 sm:flex">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <BarChart2 className="h-3.5 w-3.5 text-primary" />
            Save progress forever
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            Appear on leaderboard
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 text-secondary-border" />
            Shareable profile link
          </span>
        </div>

        {/* CTAs */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Sign up free →
          </Link>
          <button
            onClick={toggle}
            aria-label="Collapse banner"
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
