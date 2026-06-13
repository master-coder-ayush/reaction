import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { EscapeRoomEntry } from "@/components/EscapeRoomEntry";
import { loadEscapeRoom } from "@/lib/escape";
import { loadLoggedInDashboard } from "@/lib/dashboard";

// /escape-room — Escape Room mode (Sprint 5 §5.4). Open to everyone; guests can
// play but their escape time / badge won't persist. Both class tracks are loaded
// server-side so the client class selector switches instantly.

export default async function EscapeRoomPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const [doors11, doors12, xp] = await Promise.all([
    loadEscapeRoom("11"),
    loadEscapeRoom("12"),
    userId != null ? loadLoggedInDashboard(userId).then((d) => d.xp) : Promise.resolve(0),
  ]);

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <EscapeRoomEntry
          doorsByClass={{ "11": doors11, "12": doors12 }}
          isGuest={isGuest}
        />
      </main>
    </>
  );
}
