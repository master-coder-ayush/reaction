"use client";

import { useState } from "react";
import Link from "next/link";
import { CHAPTERS, type Chapter } from "@/lib/constants";

export type ChapterProgress = {
  /** Reactions mastered in this chapter. */
  mastered: number;
  /** Total reactions in this chapter. */
  total: number;
};

type Props = {
  /** Per-chapter progress keyed by chapter id (logged-in). Empty for guests. */
  progress?: Record<number, ChapterProgress>;
  /** Set of unlocked chapter ids. Ignored for guests (all unlocked). */
  unlocked?: Set<number>;
  isGuest: boolean;
};

/**
 * Chapter map (Sprint 2 §2.4, /learn). Class 11 / 12 tabs, a grid of chapter
 * cards with a mastery progress bar and lock state. Chapter 1 is always
 * unlocked; later chapters are gated behind the previous chapter's boss (logic
 * stubbed here — Sprint 5 enforces it). Guests see every chapter as accessible.
 */
export function ChapterMap({ progress = {}, unlocked, isGuest }: Props) {
  const [tab, setTab] = useState<"11" | "12">("11");

  const chapters = CHAPTERS.filter((c) => c.classLevel === tab);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {(["11", "12"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setTab(level)}
            className={
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors " +
              (tab === level
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            Class {level}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            progress={progress[chapter.id]}
            // Guests: nothing is locked on the UI. Logged-in: respect unlock set
            // (chapter 1 always unlocked).
            locked={
              isGuest
                ? false
                : chapter.unlockedBy !== null && !unlocked?.has(chapter.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
  progress,
  locked,
}: {
  chapter: Chapter;
  progress?: ChapterProgress;
  locked: boolean;
}) {
  const total = progress?.total ?? 0;
  const mastered = progress?.mastered ?? 0;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  const inner = (
    <div
      className={
        "h-full rounded-2xl border bg-card p-5 shadow-sm transition-colors " +
        (locked
          ? "border-border opacity-70"
          : "border-border hover:border-primary")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-semibold">
          {chapter.id}. {chapter.name}
        </span>
        {locked && <span aria-label="Locked">🔒</span>}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {total > 0
          ? `${mastered} / ${total} reactions mastered`
          : "No reactions yet"}
      </p>

      {locked && (
        <p className="mt-2 text-xs text-muted-foreground">
          Clear Chapter {chapter.unlockedBy}&apos;s boss to unlock.
        </p>
      )}
    </div>
  );

  if (locked) return <div>{inner}</div>;

  return (
    <Link href={`/learn/${chapter.id}`} className="block">
      {inner}
    </Link>
  );
}
