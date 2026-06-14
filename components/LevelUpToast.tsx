"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

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
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="level-up-pop overflow-hidden rounded-2xl bg-card text-center shadow-soft-lg ring-1 ring-accent/20">
        <div className="gradient-purple px-6 py-3 text-white">
          <PartyPopper className="mx-auto h-7 w-7" aria-hidden />
          <div className="mt-1 text-sm font-extrabold tracking-tight">
            Level up!
          </div>
        </div>
        <div className="px-6 py-3 text-sm font-bold text-accent-border">
          {title}
        </div>
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
