import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Settings as SettingsIcon } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AppShell } from "@/components/AppShell";
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
    <AppShell isGuest={false} username={user.username}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="fade-rise mb-6 flex items-center gap-3">
          <span className="icon-chip bg-muted text-muted-foreground">
            <SettingsIcon className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        </div>
        <SettingsForm
          username={user.username}
          initialName={user.name}
          email={user.email}
          initialPhone={user.phone ?? ""}
          initialIsPublic={user.isPublic}
        />
      </main>
    </AppShell>
  );
}
