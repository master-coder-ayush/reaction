"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  KeyRound,
  Sparkles,
  Library,
  Trophy,
  Award,
  Settings,
  LogIn,
  UserPlus,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** bg + text classes applied when the item is the active route */
  active: string;
};

// Per-feature accent mapping (see DESIGN_SYSTEM.md). One hue per destination.
// Inactive icons inherit the row text color (muted → foreground on hover); the
// active item carries its feature hue. Keep classes fully static for JIT.
const ITEMS: Item[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, active: "bg-primary-soft text-primary-border" },
  { href: "/learn", label: "Learn", icon: BookOpen, active: "bg-secondary-soft text-secondary-border" },
  { href: "/timed", label: "Timed", icon: Zap, active: "bg-warn-soft text-warn-border" },
  { href: "/escape-room", label: "Escape Room", icon: KeyRound, active: "bg-accent-soft text-accent-border" },
  { href: "/cards", label: "Cards", icon: Sparkles, active: "bg-pink-soft text-pink-border" },
  { href: "/reference", label: "Reference", icon: Library, active: "bg-info-soft text-info-border" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, active: "bg-warning-soft text-warn-border" },
  { href: "/badges", label: "Badges", icon: Award, active: "bg-accent-soft text-accent-border" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Left navigation rail. Presentational only — `collapsed` (desktop icon-only)
 * and mobile drawer behaviour are owned by {@link AppShell}. No route is ever
 * hidden from guests; the footer simply swaps profile chrome for login CTAs.
 */
export function Sidebar({
  isGuest,
  username,
  collapsed = false,
  onNavigate,
}: {
  isGuest: boolean;
  username?: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          "flex h-16 items-center gap-2.5 px-4 font-extrabold tracking-tight",
          collapsed && "justify-center px-0"
        )}
      >
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand text-base text-white shadow-soft"
        >
          <FlaskConical className="h-5 w-5" />
        </span>
        {!collapsed && (
          <span className="text-[15px] leading-tight">
            Level Up <span className="text-gradient">Chemistry</span>
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {ITEMS.map(({ href, label, icon: Icon, active }) => {
          const on = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-current={on ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                collapsed && "justify-center px-0",
                on
                  ? active
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {on && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-current"
                  style={{ width: 3 }}
                />
              )}
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: guest mode CTA or profile */}
      <div className="border-t border-border p-3">
        {isGuest ? (
          <div className={cn("space-y-2", collapsed && "space-y-1")}>
            {!collapsed && (
              <div className="flex items-center gap-2 rounded-xl bg-warning-soft px-3 py-2 text-xs font-bold text-warn-border">
                <span className="h-2 w-2 rounded-full bg-warning" />
                Guest Mode
              </div>
            )}
            <Link
              href="/login"
              onClick={onNavigate}
              title={collapsed ? "Log in" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-extrabold text-foreground transition-colors hover:bg-muted",
                collapsed && "px-0"
              )}
            >
              <LogIn className="h-4 w-4" />
              {!collapsed && "Log in"}
            </Link>
            {!collapsed && (
              <Link
                href="/signup"
                onClick={onNavigate}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-extrabold text-primary-foreground btn-chunky border-(--primary-border) transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Sign up free
              </Link>
            )}
          </div>
        ) : (
          <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
            <Link
              href={username ? `/u/${username}` : "/settings"}
              onClick={onNavigate}
              title={username ?? "Profile"}
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-purple text-sm font-extrabold text-white">
                {username?.[0]?.toUpperCase() ?? "?"}
              </span>
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    {username ?? "You"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    View profile
                  </span>
                </span>
              )}
            </Link>
            <Link
              href="/settings"
              onClick={onNavigate}
              title="Settings"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
