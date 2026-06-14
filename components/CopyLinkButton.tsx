"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button type="button" onClick={copy} variant="outline" size="sm">
      {copied ? (
        <>
          <Check className="h-4 w-4 text-primary" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Copy Profile Link
        </>
      )}
    </Button>
  );
}
