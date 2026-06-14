import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
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
        "flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm " +
        (isMe ? "bg-warning-soft" : "")
      }
    >
      <span className="w-6 text-center text-xs font-bold tabular-nums">
        {MEDALS[row.rank] ?? `#${row.rank}`}
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-[10px] font-bold text-warn-border">
        {initials(row.username)}
      </span>
      <span className="min-w-0 flex-1 truncate font-bold">
        {row.username}
        {isMe && <span className="ml-1 text-xs text-warn-border">(you)</span>}
      </span>
      <span className="text-xs font-extrabold tabular-nums">
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
    <div className="card-soft p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
          <span
            className="icon-chip h-7 w-7 bg-warning-soft text-warn-border"
            aria-hidden
          >
            <Trophy className="h-4 w-4" />
          </span>
          Weekly Leaderboard
        </h3>
        <Link
          href="/leaderboard"
          className="group inline-flex items-center gap-1 text-xs font-bold text-warn-border hover:underline"
        >
          View full
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
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
            className="block rounded-lg px-2 py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-warn-border"
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
