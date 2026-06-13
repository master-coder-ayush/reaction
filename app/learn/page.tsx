import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { ChapterMap } from "@/components/ChapterMap";
import { loadChapterProgress, loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata = { title: "Chapter Map" };

export default async function LearnPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const progressData =
    userId != null ? await loadChapterProgress(userId) : null;
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Chapter Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isGuest
            ? "Every chapter is open — practice anything you like."
            : "Clear each chapter's boss to unlock the next."}
        </p>

        <div className="mt-6">
          <ChapterMap
            isGuest={isGuest}
            progress={progressData?.chapterProgress}
            unlocked={progressData?.unlocked}
          />
        </div>
      </main>
    </>
  );
}
