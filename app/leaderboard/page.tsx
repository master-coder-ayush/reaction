import { Trophy } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import {
  loadEscapeLeaderboard,
  loadLeaderboard,
  loadSpeedLeaderboard,
} from "@/lib/leaderboard";
import { loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata = { title: "Leaderboard" };

// /leaderboard — visible to everyone (Sprint 4 §4.2). Defaults to the Weekly /
// All view; the client table handles tab + filter switching and pins the
// caller's own row. Guests see the full table but no personal rank.

export default async function LeaderboardPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const { rows, me } = await loadLeaderboard("weekly", "all", userId, 50);
  const escape = await loadEscapeLeaderboard(userId, 20);
  const speed = await loadSpeedLeaderboard(userId, 20);
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="fade-rise mb-5 flex items-center gap-3">
          <span className="icon-chip bg-warning-soft text-warn-border">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">
              See how you stack up against other students.
            </p>
          </div>
        </div>

        <LeaderboardTable
          initialPeriod="weekly"
          initialClass="all"
          initialRows={rows}
          initialMe={me}
          initialEscapeRows={escape.rows}
          initialEscapeMe={escape.me}
          initialSpeedRows={speed.rows}
          initialSpeedMe={speed.me}
          isGuest={isGuest}
        />
      </main>
    </AppShell>
  );
}
