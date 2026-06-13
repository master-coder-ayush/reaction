import type { Metadata } from "next";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { ReferenceList } from "@/components/ReferenceList";
import { REFERENCE_SECTIONS } from "@/lib/reference";
import { loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Reagent Reference",
  description:
    "A colour-coded cheat sheet of organic chemistry reagents — oxidising, reducing, halogenating agents, bases, nucleophiles, and electrophiles.",
};

// /reference (Sprint 8 §8.3). Full reagent classification reference, searchable
// and colour-coded. Open to everyone.

export default async function ReferencePage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">📚 Reagent Reference</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Know your reagents. Colour-coded by the reaction type they drive.
        </p>

        <div className="mt-6">
          <ReferenceList sections={REFERENCE_SECTIONS} />
        </div>
      </main>
    </>
  );
}
