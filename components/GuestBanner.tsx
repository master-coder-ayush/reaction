import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Slim, always-visible, non-blocking sign-up reminder for guests (PLAN.md §2,
 * Sprint 2 §2.1). Rendered only when there is no session — never shown to
 * logged-in users. No modal, no dismissal.
 */
export function GuestBanner() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-1.5 border-b border-secondary/20 bg-secondary-soft/60 px-4 py-2 text-center text-sm text-foreground">
      <Sparkles className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
      <span>
        You&apos;re practicing as a guest — your progress won&apos;t be saved.{" "}
        <Link
          href="/signup"
          className="font-bold text-secondary hover:underline"
        >
          Sign up free
        </Link>{" "}
        to keep your XP, earn badges, and join the leaderboard.
      </span>
    </div>
  );
}
