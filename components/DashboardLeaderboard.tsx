import Link from "next/link";
import type { LeaderboardRow } from "@/lib/leaderboard";

// Dashboard leaderboard widget (Sprint 4 §4.5): top 3 weekly + the user's own
// row, with a link to the full leaderboard. Guests see the top 3 plus a sign-up
// row. Pure presentational — data is loaded by the dashboard page.

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function Row({ row, isMe }: { row: LeaderboardRow; isMe?: boolean }) {
  return (
    <li
      className={
        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm " +
        (isMe ? "bg-primary/10" : "")
      }
    >
      <span className="w-6 text-center text-xs font-semibold tabular-nums">
        {MEDALS[row.rank] ?? `#${row.rank}`}
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
        {initials(row.username)}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {row.username}
        {isMe && <span className="ml-1 text-xs text-primary">(you)</span>}
      </span>
      <span className="text-xs font-bold tabular-nums">
        {row.xp.toLocaleString()}
      </span>
    </li>
  );
}

export function DashboardLeaderboard({
  top,
  me,
  isGuest,
}: {
  top: LeaderboardRow[];
  me: LeaderboardRow | null;
  isGuest: boolean;
}) {
  const meInTop = me != null && top.some((r) => r.userId === me.userId);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">🏆 Weekly Leaderboard</h3>
        <Link
          href="/leaderboard"
          className="text-xs font-medium text-primary hover:underline"
        >
          View full →
        </Link>
      </div>

      {top.length === 0 ? (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          No XP earned this week yet.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {top.map((r) => (
            <Row key={r.userId} row={r} isMe={me?.userId === r.userId} />
          ))}
        </ul>
      )}

      {isGuest ? (
        <div className="mt-2 border-t border-dashed border-border pt-2">
          <Link
            href="/signup"
            className="block rounded-lg px-2 py-1.5 text-center text-xs text-muted-foreground hover:text-primary"
          >
            Sign up to appear on the leaderboard
          </Link>
        </div>
      ) : (
        me &&
        !meInTop && (
          <div className="mt-2 border-t border-dashed border-border pt-2">
            <Row row={me} isMe />
          </div>
        )
      )}
    </div>
  );
}
