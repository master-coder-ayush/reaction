import Link from "next/link";
import { SessionXpCounter } from "@/components/SessionXpCounter";

/**
 * Top navigation. Always shows the session XP counter (Sprint 2 §2.2/§2.3) —
 * guests read it from localStorage, logged-in users get their stored XP.
 */
export function Nav({
  isGuest,
  xp = 0,
  username,
}: {
  isGuest: boolean;
  xp?: number;
  username?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-bold tracking-tight">
          Level Up <span className="text-primary">Chemistry</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
          <Link href="/learn" className="hover:text-foreground">
            Learn
          </Link>
          <Link href="/leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <SessionXpCounter isGuest={isGuest} initialXp={xp} />
          {isGuest ? (
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          ) : (
            <Link
              href={username ? `/u/${username}` : "/settings"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
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
