import Link from "next/link";

/**
 * Slim, always-visible, non-blocking sign-up reminder for guests (PLAN.md §2,
 * Sprint 2 §2.1). Rendered only when there is no session — never shown to
 * logged-in users. No modal, no dismissal.
 */
export function GuestBanner() {
  return (
    <div className="w-full border-b border-border bg-muted/60 px-4 py-2 text-center text-sm text-muted-foreground">
      You&apos;re practicing as a guest — your progress won&apos;t be saved.{" "}
      <Link
        href="/signup"
        className="font-semibold text-primary hover:underline"
      >
        Sign up free
      </Link>{" "}
      to keep your XP, earn badges, and join the leaderboard.
    </div>
  );
}
