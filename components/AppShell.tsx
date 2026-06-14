"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  PanelTop,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Nav } from "@/components/Nav";
import { SessionXpCounter } from "@/components/SessionXpCounter";
import { cn } from "@/lib/utils";
import { GuestBanner } from "@/components/GuestBanner";

type LayoutMode = "sidebar" | "topbar";

const LAYOUT_KEY = "lu-layout";
const COLLAPSE_KEY = "lu-sidebar-collapsed";

/**
 * App chrome wrapper. Replaces the old per-page `<Nav> + <GuestBanner>` block.
 * The left {@link Sidebar} is the primary navigation (collapsible on desktop,
 * an off-canvas drawer on mobile). A persisted toggle switches to the classic
 * top-navbar ({@link Nav}) variant. Page content is rendered as `children`
 * (each page keeps its own `<main>` width/padding). UI only — no data here.
 */
export function AppShell({
  isGuest,
  xp = 0,
  username,
  children,
}: {
  isGuest: boolean;
  xp?: number;
  username?: string | null;
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<LayoutMode>("sidebar");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read persisted prefs after mount (avoids SSR/client hydration mismatch).
  useEffect(() => {
    try {
      const m = window.localStorage.getItem(LAYOUT_KEY);
      if (m === "topbar" || m === "sidebar") setMode(m);
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function toggleLayout() {
    setMode((m) => {
      const next = m === "sidebar" ? "topbar" : "sidebar";
      try {
        window.localStorage.setItem(LAYOUT_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // --- Top-navbar variant -------------------------------------------------
  if (mode === "topbar") {
    return (
      <>
        <Nav
          isGuest={isGuest}
          xp={xp}
          username={username}
          onToggleLayout={toggleLayout}
        />
        <div className={cn("bg-app flex flex-1 flex-col", isGuest && "pb-20")}>
          {children}
        </div>
        {isGuest && <GuestBanner />}
      </>
    );
  }

  // --- Sidebar variant (default) -----------------------------------------
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop rail */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <Sidebar isGuest={isGuest} username={username} collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-soft-lg">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar
              isGuest={isGuest}
              username={username}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur" style={{backgroundColor: "#35c19f"}}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1" />

          <SessionXpCounter isGuest={isGuest} initialXp={xp} />

          <button
            onClick={toggleLayout}
            title="Switch to top-bar layout"
            aria-label="Switch to top-bar layout"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <PanelTop className="h-5 w-5" />
          </button>

          {/* Compact profile / login (mobile — desktop has it in the rail) */}
          {isGuest ? (
            <Link
              href="/login"
              aria-label="Log in"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-primary hover:bg-muted lg:hidden"
            >
              <LogIn className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href={username ? `/u/${username}` : "/settings"}
              aria-label="Your profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full gradient-purple text-sm font-extrabold text-white lg:hidden"
            >
              {username?.[0]?.toUpperCase() ?? "?"}
            </Link>
          )}
        </header>

        <div className={cn("bg-app flex flex-1 flex-col", isGuest && "pb-20")}>
          {children}
        </div>
      </div>
      {isGuest && <GuestBanner />}
    </div>
  );
}
