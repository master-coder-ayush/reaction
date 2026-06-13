"use client";

import { useState } from "react";

// CopyLinkButton (Sprint 8 §8.1). Copies the public profile URL to the clipboard
// and shows a brief "Copied!" confirmation.

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
    >
      {copied ? "✓ Copied!" : "🔗 Copy Profile Link"}
    </button>
  );
}
