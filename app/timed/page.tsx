import { eq } from "drizzle-orm";
import { Zap } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";
import { AppShell } from "@/components/AppShell";
import { TimedSession } from "@/components/TimedSession";
import { loadAllReactions } from "@/lib/practice";
import { loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata = { title: "Timed Challenge" };

// /timed — Module 5 Timed Challenge (Sprint 7 §7.2). 60-second burst mode over
// the full reaction pool. Logged-in users post their score to the Speed
// leaderboard and can earn Speed Demon; guests play with localStorage XP only.

export default async function TimedPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const reactions = await loadAllReactions();

  let xp = 0;
  let best: number | null = null;
  if (userId != null) {
    const [dash, statsRow] = await Promise.all([
      loadLoggedInDashboard(userId),
      db
        .select({ best: userStats.bestTimedScore })
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1),
    ]);
    xp = dash.xp;
    best = statsRow[0]?.best ?? null;
  }

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="icon-chip bg-warn-soft text-warn-border" aria-hidden>
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Timed Challenge
            </h1>
            <p className="text-sm text-muted-foreground">
              60 seconds. As many reactions as you can.
            </p>
          </div>
        </div>

        <TimedSession
          reactions={reactions}
          isGuest={isGuest}
          initialBest={best}
        />
      </main>
    </AppShell>
  );
}
