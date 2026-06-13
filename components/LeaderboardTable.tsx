"use client";

import { useEffect, useState } from "react";
import type {
  ClassFilter,
  LeaderboardRow,
  Period,
} from "@/lib/leaderboard";

// Leaderboard table with period tabs + class filter chips (Sprint 4 §4.2).
// Medals for the top 3, the caller's own row pinned at the bottom and
// highlighted (shown even if outside the top 10), and a guest "sign up" row.

const TABS: { key: Period; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all-time", label: "All-Time" },
];

const FILTERS: { key: ClassFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "11", label: "Class 11" },
  { key: "12", label: "Class 12" },
];

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

type Props = {
  initialPeriod: Period;
  initialClass: ClassFilter;
  initialRows: LeaderboardRow[];
  initialMe: LeaderboardRow | null;
  isGuest: boolean;
};

export function LeaderboardTable({
  initialPeriod,
  initialClass,
  initialRows,
  initialMe,
  isGuest,
}: Props) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [classFilter, setClassFilter] = useState<ClassFilter>(initialClass);
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);
  const [me, setMe] = useState<LeaderboardRow | null>(initialMe);
  const [loading, setLoading] = useState(false);

  // Refetch when the period or class filter changes. The initial render uses the
  // server-provided data, so skip the first effect run.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (!hydrated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&class=${classFilter}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data.rows) ? data.rows : []);
        setMe(data.me ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setMe(null);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, classFilter]);

  // Whether the caller's own row already appears in the visible top rows.
  const meInTop = me != null && rows.some((r) => r.userId === me.userId);

  return (
    <div>
      {/* Period tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setPeriod(t.key)}
            className={
              "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (period === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Class filter chips */}
      <div className="mt-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setClassFilter(f.key)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (classFilter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Rank</span>
          <span>Student</span>
          <span className="text-right">XP</span>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No one has earned XP in this period yet. Be the first!
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <LeaderboardRowItem
                key={r.userId}
                row={r}
                isMe={me?.userId === r.userId}
              />
            ))}
          </ul>
        )}

        {/* Own row pinned at the bottom, highlighted — guest or logged-out user
            gets a sign-up prompt instead (Sprint 4 §4.2). */}
        {isGuest ? (
          <div className="border-t-2 border-dashed border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
            <a href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </a>{" "}
            to appear on the leaderboard
          </div>
        ) : (
          me &&
          !meInTop && (
            <div className="border-t-2 border-dashed border-border">
              <LeaderboardRowItem row={me} isMe />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function LeaderboardRowItem({
  row,
  isMe,
}: {
  row: LeaderboardRow;
  isMe: boolean;
}) {
  return (
    <li
      className={
        "grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 " +
        (isMe ? "bg-primary/10" : "")
      }
    >
      <span className="text-center text-sm font-semibold tabular-nums">
        {MEDALS[row.rank] ?? `#${row.rank}`}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {initials(row.username)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {row.username}
            {isMe && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                YOU
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.levelTitle} · 🔥 {row.streak}
          </p>
        </div>
      </div>

      <span className="text-right text-sm font-bold tabular-nums">
        {row.xp.toLocaleString()}
      </span>
    </li>
  );
}
