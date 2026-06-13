"use client";

import { useMemo, useState } from "react";
import { ReactionCard } from "@/components/ReactionCard";
import type { ReactionCardDTO } from "@/lib/cards";

// ---------------------------------------------------------------------------
// CardGrid (Sprint 7 §7.4). The reaction-card collection grid with a progress
// counter and filters (by chapter, by reaction type, unlocked-only). For
// logged-in users it shows unlocked cards in color and the rest as silhouettes;
// guests see every card in full color with a sign-up watermark (no gating).
// ---------------------------------------------------------------------------

export function CardGrid({
  cards,
  isGuest,
}: {
  cards: ReactionCardDTO[];
  isGuest: boolean;
}) {
  const [chapter, setChapter] = useState<number | "all">("all");
  const [type, setType] = useState<string | "all">("all");
  const [unlockedOnly, setUnlockedOnly] = useState(false);

  const chapters = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of cards) map.set(c.chapterId, c.chapterName);
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [cards]);

  const types = useMemo(
    () => [...new Set(cards.map((c) => c.typeName))].sort(),
    [cards]
  );

  const unlockedCount = cards.filter((c) => c.unlocked).length;

  const filtered = cards.filter((c) => {
    if (chapter !== "all" && c.chapterId !== chapter) return false;
    if (type !== "all" && c.typeName !== type) return false;
    // "Unlocked only" is meaningless for guests (none persist) — ignore it there.
    if (!isGuest && unlockedOnly && !c.unlocked) return false;
    return true;
  });

  return (
    <div>
      <p className="mt-1 text-sm text-muted-foreground">
        {isGuest
          ? `${cards.length} reactions to collect — sign up to start keeping cards`
          : `${unlockedCount} / ${cards.length} cards collected`}
      </p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={chapter}
          onChange={(e) =>
            setChapter(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="all">All chapters</option>
          {chapters.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {!isGuest && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <input
              type="checkbox"
              checked={unlockedOnly}
              onChange={(e) => setUnlockedOnly(e.target.checked)}
              className="accent-primary"
            />
            Unlocked only
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          No cards match these filters.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => (
            <ReactionCard key={c.reactionId} card={c} isGuest={isGuest} />
          ))}
        </div>
      )}
    </div>
  );
}
