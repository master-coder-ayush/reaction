"use client";

import { useEffect, useState } from "react";

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
    <div className="flex items-start justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
      <p>
        Welcome to Level Up Chemistry, <strong>{name}</strong>!{" "}
        {transferredXp > 0
          ? `Your ${transferredXp} guest XP has been saved to your account.`
          : "Your account is ready — let's earn some XP."}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 rounded-md px-1 text-success/70 hover:text-success"
      >
        ✕
      </button>
    </div>
  );
}
