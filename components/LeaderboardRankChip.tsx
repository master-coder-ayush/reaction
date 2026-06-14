import Link from "next/link";
import { Trophy } from "lucide-react";

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
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-warning hover:text-warn-border"
      >
        <Trophy className="h-4 w-4 text-warning" aria-hidden />
        Sign up to appear on the leaderboard
      </Link>
    );
  }

  return (
    <Link
      href="/leaderboard"
      className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-1.5 text-sm font-bold text-warn-border transition-colors hover:bg-warning-soft/70"
    >
      <Trophy className="h-4 w-4" aria-hidden />
      Weekly rank:{" "}
      <span className="font-extrabold">
        {rank != null ? `#${rank}` : "Unranked"}
      </span>
    </Link>
  );
}
