"use client";

import { useEffect, useState } from "react";

/**
 * Level-up toast/animation (Sprint 2 §2.5). Listens for a global `level-up`
 * CustomEvent ({ detail: { title } }) so both the guest XP path and the API
 * path can fire it. Auto-dismisses after the pop animation.
 *
 * Trigger from anywhere with:
 *   window.dispatchEvent(new CustomEvent("level-up", { detail: { title } }))
 */
export function LevelUpToast() {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const onLevelUp = (e: Event) => {
      const detail = (e as CustomEvent<{ title?: string }>).detail;
      setTitle(detail?.title ?? "New level!");
      const id = setTimeout(() => setTitle(null), 2400);
      return () => clearTimeout(id);
    };
    window.addEventListener("level-up", onLevelUp);
    return () => window.removeEventListener("level-up", onLevelUp);
  }, []);

  if (!title) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center">
      <div className="level-up-pop rounded-2xl border border-primary/40 bg-card px-6 py-4 text-center shadow-lg">
        <div className="text-2xl">🎉</div>
        <div className="mt-1 text-sm font-semibold">Level up!</div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
    </div>
  );
}

/** Helper to fire the level-up toast from any client component. */
export function fireLevelUp(title: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("level-up", { detail: { title } }));
  }
}
