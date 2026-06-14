"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Swords, ArrowRight } from "lucide-react";
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
      <div className="mb-4 inline-flex rounded-xl border border-border bg-muted p-1">
        {(["11", "12"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setTab(level)}
            className={
              "rounded-lg px-4 py-1.5 text-sm font-bold transition-colors " +
              (tab === level
                ? "bg-secondary text-secondary-foreground shadow-soft"
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
            locked={false}
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
  const prevName =
    chapter.unlockedBy != null
      ? CHAPTERS.find((c) => c.id === chapter.unlockedBy)?.name ?? null
      : null;

  return (
    <div
      className={
        "card-soft h-full transition-all " +
        (locked
          ? "opacity-70"
          : "hover:-translate-y-0.5 hover:shadow-soft-lg")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-base font-extrabold tracking-tight">
          {chapter.id}. {chapter.name}
        </span>
        {locked && (
          <span className="text-muted-foreground" aria-label="Locked">
            <Lock className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-muted-foreground">
        {total > 0
          ? `${mastered} / ${total} reactions mastered`
          : "No reactions yet"}
      </p>

      {locked ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Clear the {prevName ?? `Chapter ${chapter.unlockedBy}`} Boss Level to
          unlock this chapter.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold">
          <Link
            href={`/learn/${chapter.id}`}
            className="inline-flex items-center gap-1 text-secondary-border hover:underline"
          >
            Open chapter <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href={`/practice/${chapter.id}/module-1`}
            className="inline-flex items-center gap-1 text-primary-border hover:underline"
          >
            Practice <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link
            href={`/boss/${chapter.id}`}
            className="inline-flex items-center gap-1 text-destructive-border hover:underline"
          >
            <Swords className="h-3.5 w-3.5" aria-hidden /> Boss Level
          </Link>
        </div>
      )}
    </div>
  );
}
