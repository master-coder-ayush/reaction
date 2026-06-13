import Link from "next/link";

/**
 * Weekly leaderboard rank chip (Sprint 2 §2.2/§2.3). Logged-in users see their
 * rank; guests see a prompt to sign up to appear on the leaderboard.
 */
export function LeaderboardRankChip({
  rank,
  isGuest,
}: {
  rank?: number | null;
  isGuest: boolean;
}) {
  if (isGuest) {
    return (
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary"
      >
        🏆 Sign up to appear on the leaderboard
      </Link>
    );
  }

  return (
    <Link
      href="/leaderboard"
      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/70"
    >
      🏆 Weekly rank:{" "}
      <span className="font-semibold">
        {rank != null ? `#${rank}` : "Unranked"}
      </span>
    </Link>
  );
}
