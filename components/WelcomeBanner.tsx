"use client";

import { useEffect, useState } from "react";
import { PartyPopper, X } from "lucide-react";

/**
 * One-time welcome banner shown after the sign-up redirect (Sprint 2 §2.1).
 * Reads `name` and transferred `xp` from props (passed via the `?welcome=1`
 * redirect + session). Dismissable, and self-dismisses on the next load by
 * stripping the `welcome` query param.
 */
export function WelcomeBanner({
  name,
  transferredXp,
}: {
  name: string;
  transferredXp: number;
}) {
  const [dismissed, setDismissed] = useState(false);

  // Strip ?welcome=1 from the URL so a refresh doesn't show it again.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("welcome")) {
      url.searchParams.delete("welcome");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="fade-rise relative flex items-start justify-between gap-3 overflow-hidden rounded-2xl gradient-brand px-5 py-4 text-sm text-white shadow-soft">
      <div className="flex items-start gap-3">
        <span
          className="icon-chip bg-white/20 text-white"
          aria-hidden
        >
          <PartyPopper className="h-5 w-5" />
        </span>
        <p className="leading-relaxed">
          Welcome to Level Up Chemistry, <strong>{name}</strong>!{" "}
          {transferredXp > 0
            ? `Your ${transferredXp} guest XP has been saved to your account.`
            : "Your account is ready — let's earn some XP."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
