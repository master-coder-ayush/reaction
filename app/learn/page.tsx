export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Map } from "lucide-react";

export const metadata: Metadata = {
  title: "Chapter Map",
  description:
    "Choose a chapter to practice — Hydrocarbons, Haloalkanes, Alcohols, Aldehydes, Carboxylic Acids, Amines and more. Class 11 & 12 Organic Chemistry.",
  openGraph: {
    title: "Chapter Map · Level Up Chemistry",
    description: "Pick a chapter and start practicing Class 11 & 12 Organic Chemistry reactions.",
  },
};
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { ChapterMap } from "@/components/ChapterMap";
import { loadChapterProgress, loadLoggedInDashboard } from "@/lib/dashboard";


export default async function LearnPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const progressData =
    userId != null ? await loadChapterProgress(userId) : null;
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="fade-rise flex items-center gap-3">
          <span className="icon-chip bg-secondary-soft text-secondary-border">
            <Map className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Chapter Map
            </h1>
            <p className="text-sm text-muted-foreground">
              Every chapter is open — practice anything you like.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ChapterMap
            isGuest={isGuest}
            progress={progressData?.chapterProgress}
            unlocked={progressData?.unlocked}
          />
        </div>
      </main>
    </AppShell>
  );
}
