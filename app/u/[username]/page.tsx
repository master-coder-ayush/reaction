import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Settings as SettingsIcon, Flame } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { BadgeGrid } from "@/components/BadgeGrid";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { loadProfile, avatarHue } from "@/lib/profile";
import { reactionColorVar } from "@/lib/constants";

const SITE = "levelupchemistry.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile || !profile.isPublic) {
    return { title: "Profile" };
  }
  const title = `${profile.name} (@${profile.username})`;
  const description = `Check out ${profile.name}'s chemistry progress on Level Up Chemistry — Level ${profile.level} ${profile.levelTitle}, ${profile.xp} XP, ${profile.cardCount} cards collected.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const isGuest = !session?.user?.id;
  const viewerUsername = session?.user?.username;

  const profile = await loadProfile(username);

  // Guest visiting their *own* would-be profile can't exist (guests have no
  // account), so no special redirect needed here — only the settings/own-profile
  // edge case (§8.8) applies when a username matches but the viewer is a guest.

  if (!profile) {
    return (
      <AppShell isGuest={isGuest} username={viewerUsername}>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
          <h1 className="text-xl font-extrabold tracking-tight">
            User not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No student with username “{username}”.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </main>
      </AppShell>
    );
  }

  const isOwn = viewerUsername === profile.username;

  // Private profile: show nothing but the notice (unless it's your own).
  if (!profile.isPublic && !isOwn) {
    return (
      <AppShell isGuest={isGuest} username={viewerUsername}>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
          <span className="icon-chip mx-auto bg-muted text-muted-foreground">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight">
            This profile is private.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            @{profile.username} has chosen to keep their progress private.
          </p>
        </main>
      </AppShell>
    );
  }

  const hue = avatarHue(profile.username);
  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
  const profileUrl = `${SITE}/u/${profile.username}`;

  return (
    <AppShell isGuest={isGuest} username={viewerUsername}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Header */}
        <div className="fade-rise gradient-purple shadow-soft-lg relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold text-white ring-4 ring-white/30"
              style={{ backgroundColor: `hsl(${hue} 65% 45%)` }}
            >
              {profile.username.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {profile.name}
              </h1>
              <p className="text-sm font-medium text-white/80">
                @{profile.username} · Class {profile.classLevel} · Member since{" "}
                {memberSince}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                Level {profile.level} · {profile.levelTitle}
              </span>

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <CopyLinkButton url={profileUrl} />
                {isOwn && (
                  <Link
                    href="/settings"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/20 px-3 text-sm font-bold text-white backdrop-blur hover:bg-white/30"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="XP" value={profile.xp.toLocaleString()} />
          <Stat label="Accuracy" value={`${profile.accuracy}%`} />
          <Stat
            label="Streak"
            value={
              <span className="inline-flex items-center gap-1">
                <Flame className="h-4 w-4 text-warn" />
                {profile.streakCurrent}
              </span>
            }
            sub={`Best ${profile.streakLongest}`}
          />
          <Stat
            label="Cards"
            value={`${profile.cardCount} / ${profile.totalCards}`}
          />
        </div>

        {/* Card showcase */}
        {profile.showcase.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">
              Recent Cards
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.showcase.map((c) => (
                <span
                  key={c.reactionId}
                  className="rounded-xl border-2 bg-card px-3 py-1.5 text-sm font-bold shadow-soft"
                  style={{ borderColor: reactionColorVar(c.typeColor) }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Badges */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight">Badges</h2>
          <BadgeGrid badges={profile.badges} isGuest={false} />
        </section>

        {/* Guest CTA */}
        {isGuest && (
          <div className="gradient-brand shadow-soft-lg mt-10 rounded-2xl p-6 text-center text-white">
            <p className="text-base font-extrabold">
              Create your own profile free at Level Up Chemistry.
            </p>
            <Link
              href="/signup"
              className="btn-chunky mt-3 inline-flex h-11 items-center justify-center rounded-2xl border-(--primary-border) bg-primary px-5 text-sm font-extrabold tracking-wide text-primary-foreground"
            >
              Sign up free
            </Link>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="card-soft p-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
