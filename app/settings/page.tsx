import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { Nav } from "@/components/Nav";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = {
  title: "Settings",
};

// /settings (Sprint 8 §8.2, §8.8). Logged-in only — guests are redirected to
// /login with a message.

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?message=Sign+in+to+access+your+profile.");
  }
  const userId = Number(session.user.id);

  const [user] = await db
    .select({
      username: users.username,
      name: users.name,
      email: users.email,
      phone: users.phone,
      isPublic: users.isPublic,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    redirect("/login?message=Sign+in+to+access+your+profile.");
  }

  return (
    <>
      <Nav isGuest={false} username={user.username} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>
        <SettingsForm
          username={user.username}
          initialName={user.name}
          email={user.email}
          initialPhone={user.phone ?? ""}
          initialIsPublic={user.isPublic}
        />
      </main>
    </>
  );
}
