"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, PanelLeft, LogIn } from "lucide-react";
import { SessionXpCounter } from "@/components/SessionXpCounter";
import { cn } from "@/lib/utils";

/**
 * Top navigation — the optional second layout variant (the left sidebar is the
 * default; see {@link AppShell}). Always shows the session XP counter; guests
 * get a Guest Mode badge and a log-in link, never a wall. `onToggleLayout`
 * switches back to the sidebar layout when rendered inside the shell.
 */
export function Nav({
  isGuest,
  xp = 0,
  username,
  onToggleLayout,
}: {
  isGuest: boolean;
  xp?: number;
  username?: string | null;
  onToggleLayout?: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/learn", label: "Learn" },
    { href: "/timed", label: "Timed" },
    { href: "/escape-room", label: "Escape Room" },
    { href: "/cards", label: "Cards" },
    { href: "/reference", label: "Reference" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/badges", label: "Badges" },
  ];
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-base text-white shadow-soft"
          >
            <FlaskConical className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">
            Level Up <span className="text-gradient">Chemistry</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 text-sm font-bold text-muted-foreground lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2 transition-colors",
                isActive(l.href)
                  ? "bg-secondary-soft text-secondary-border"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isGuest && (
            <span className="hidden items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warn-border sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-warning" />
              Guest Mode
            </span>
          )}
          <SessionXpCounter isGuest={isGuest} initialXp={xp} />
          {onToggleLayout && (
            <button
              onClick={onToggleLayout}
              title="Switch to sidebar layout"
              aria-label="Switch to sidebar layout"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}
          {isGuest ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold text-primary transition-colors hover:bg-muted"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          ) : (
            <Link
              href={username ? `/u/${username}` : "/settings"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full gradient-purple text-sm font-extrabold text-white shadow-soft"
              aria-label="Your profile"
            >
              {username?.[0]?.toUpperCase() ?? "?"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
