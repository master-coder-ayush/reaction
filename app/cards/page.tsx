import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { reactionCards, reactions, reactionOptions, reactionTypes } from "@/db/schema";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { PathwayChain } from "@/components/PathwayChain";
import { loadPathwayCards } from "@/lib/pathway";
import { loadLoggedInDashboard } from "@/lib/dashboard";
import { reactionColorVar } from "@/lib/constants";

// /cards — Reaction card collection (PLAN.md §9) + the Pathway Cards section
// (Sprint 6 §6.1). Reaction cards unlock on mastering a reaction (3 correct);
// pathway cards on completing a pathway challenge. Guests don't persist cards,
// so they see a sign-up nudge instead.

function stars(difficulty: number): string {
  const n = Math.min(3, Math.max(1, difficulty));
  return "⭐".repeat(n);
}

export default async function CardsPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  if (userId == null) {
    return (
      <>
        <GuestBanner />
        <Nav isGuest />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <h1 className="text-2xl font-bold tracking-tight">Reaction Cards</h1>
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="text-4xl">🃏</div>
            <h2 className="mt-3 text-lg font-semibold">
              Collect cards by mastering reactions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cards aren&apos;t saved for guests.{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up free
              </Link>{" "}
              to keep every card you earn.
            </p>
          </div>
        </main>
      </>
    );
  }

  const xp = (await loadLoggedInDashboard(userId)).xp;

  // Reaction cards (newest first), joined to their reaction + type + correct
  // reactant/reagent/product options for the card face.
  const cardRows = await db
    .select({
      reactionId: reactionCards.reactionId,
      unlockedAt: reactionCards.unlockedAt,
      name: reactions.name,
      difficulty: reactions.difficulty,
      typeName: reactionTypes.name,
      typeColor: reactionTypes.color,
    })
    .from(reactionCards)
    .innerJoin(reactions, eq(reactionCards.reactionId, reactions.id))
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(reactionCards.userId, userId))
    .orderBy(desc(reactionCards.unlockedAt));

  // Correct options per reaction, for the card's R / reagent / P summary.
  const optionByReaction = new Map<
    number,
    { reactant?: string; reagent?: string; product?: string }
  >();
  if (cardRows.length > 0) {
    const correctRows = await db
      .select({
        reactionId: reactionOptions.reactionId,
        optionType: reactionOptions.optionType,
        text: reactionOptions.text,
        isCorrect: reactionOptions.isCorrect,
      })
      .from(reactionOptions)
      .where(
        inArray(
          reactionOptions.reactionId,
          cardRows.map((c) => c.reactionId)
        )
      );
    for (const o of correctRows) {
      if (!o.isCorrect) continue;
      const entry = optionByReaction.get(o.reactionId) ?? {};
      if (o.optionType === "reactant") entry.reactant = o.text;
      else if (o.optionType === "reagent") entry.reagent = o.text;
      else if (o.optionType === "product") entry.product = o.text;
      optionByReaction.set(o.reactionId, entry);
    }
  }

  const pathwayCardRows = await loadPathwayCards(userId);

  const [{ total }] = await db
    .select({ total: count() })
    .from(reactions);

  return (
    <>
      <Nav isGuest={false} xp={xp} username={session?.user?.username} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Reaction Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cardRows.length} / {total} cards collected
        </p>

        {cardRows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            No cards yet — master a reaction (3 correct answers) to unlock its
            card.
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cardRows.map((c) => {
              const opt = optionByReaction.get(c.reactionId) ?? {};
              const color = reactionColorVar(c.typeColor);
              return (
                <div
                  key={c.reactionId}
                  className="rounded-2xl border-2 bg-card p-4 shadow-sm"
                  style={{ borderColor: color }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        color,
                        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                      }}
                    >
                      {c.typeName}
                    </span>
                    <span className="text-xs">{stars(c.difficulty)}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold leading-tight">
                    {c.name}
                  </h3>
                  {(opt.reactant || opt.product) && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {opt.reactant ?? "?"}{" "}
                      {opt.reagent ? `—[${opt.reagent}]→` : "→"}{" "}
                      {opt.product ?? "?"}
                    </p>
                  )}
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Unlocked {c.unlockedAt.toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Pathway cards. */}
        <h2 className="mt-12 text-xl font-bold tracking-tight">Pathway Cards</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {pathwayCardRows.length} pathway
          {pathwayCardRows.length === 1 ? "" : "s"} completed
        </p>

        {pathwayCardRows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            Complete a{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Pathway Challenge
            </Link>{" "}
            to earn your first pathway card.
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
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
        )}
      </main>
    </>
  );
}
