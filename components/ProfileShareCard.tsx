"use client";

import { useState, useEffect } from "react";
import { Link2, MessageCircle, Mail } from "lucide-react";

export function ProfileShareCard({ username }: { username: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileUrl = `${origin}/u/${username}`;

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="card-soft p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-border">
          <Link2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Your profile link</p>
          <p className="truncate text-xs text-muted-foreground">{profileUrl || `…/u/${username}`}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition hover:border-accent-border hover:bg-accent-soft"
        >
          <Link2 className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy link"}
        </button>

        {origin && (
          <>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out my chemistry profile: ${profileUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
              WhatsApp
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent("My Chemistry Profile")}&body=${encodeURIComponent(`Check out my profile: ${profileUrl}`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold transition hover:border-accent-border hover:bg-accent-soft"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </>
        )}
      </div>
    </div>
  );
}
