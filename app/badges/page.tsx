import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { BadgeGrid } from "@/components/BadgeGrid";
import { loadBadgesWithState } from "@/lib/badges";
import { loadLoggedInDashboard } from "@/lib/dashboard";

// /badges — grid of all badges (Sprint 4 §4.3). Earned shown in colour with the
// date; unearned grayed out with requirement text. Guests see all locked with
// "sign up to earn badges".

export default async function BadgesPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const badges = await loadBadgesWithState(userId);
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  const earnedCount = isGuest
    ? 0
    : badges.filter((b) => b.earnedAt != null).length;

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">🏅 Badges</h1>
          <p className="text-sm text-muted-foreground">
            {isGuest
              ? "Sign up to start earning badges as you practise."
              : `${earnedCount} of ${badges.length} badges earned.`}
          </p>
        </div>

        <BadgeGrid badges={badges} isGuest={isGuest} />
      </main>
    </>
  );
}
