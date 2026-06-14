import Link from "next/link";
import { Layers } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { CardGrid } from "@/components/CardGrid";
import { PathwayChain } from "@/components/PathwayChain";
import { loadReactionCards } from "@/lib/cards";
import { loadPathwayCards } from "@/lib/pathway";
import { loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata = { title: "Reaction Cards" };

// /cards — Reaction card collection (PLAN.md §9, Sprint 7 §7.4) + the Pathway
// Cards section (Sprint 6 §6.1). The grid is open to everyone: logged-in users
// see unlocked cards in color and the rest as silhouettes (collection progress,
// not a gate); guests see every card with a "Sign up to keep" watermark. Cards
// never gate practice — everything stays open to guests.

export default async function CardsPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const cards = await loadReactionCards(userId);
  const pathwayCardRows = userId != null ? await loadPathwayCards(userId) : [];
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="fade-rise mb-6 flex items-center gap-3">
          <span className="icon-chip bg-pink-soft text-pink-border">
            <Layers className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Reaction Cards
          </h1>
        </div>

        <CardGrid cards={cards} isGuest={isGuest} />

        {/* Pathway cards (logged-in). */}
        <h2 className="mt-12 text-xl font-bold tracking-tight">Pathway Cards</h2>
        {isGuest ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            Complete a{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Pathway Challenge
            </Link>
            .{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>{" "}
            to keep the pathway cards you earn.
          </div>
        ) : pathwayCardRows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            Complete a{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Pathway Challenge
            </Link>{" "}
            to earn your first pathway card.
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {pathwayCardRows.length} pathway
              {pathwayCardRows.length === 1 ? "" : "s"} completed
            </p>
            <div className="mt-4 grid gap-3">
              {pathwayCardRows.map(({ pathway, unlockedAt }) => (
                <div
                  key={pathway.id}
                  className="rounded-2xl border-2 border-primary/50 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">
                      {pathway.startCompound} → {pathway.endCompound}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {unlockedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 overflow-x-auto">
                    <PathwayChain steps={pathway.steps} compact />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
