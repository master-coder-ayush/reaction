import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

// /api/user/settings (Sprint 8 §8.2).
//   PATCH  — update account fields (name, phone), privacy, or change password.
//   DELETE — delete the account and all its data (cascades via FKs).
// Logged-in only.

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => null)),
  isPublic: z.boolean().optional(),
  // Password change: both required together.
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters.").optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, phone, isPublic, currentPassword, newPassword } = parsed.data;

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (phone !== undefined) update.phone = phone;
  if (isPublic !== undefined) update.isPublic = isPublic;

  // Password change path — verify the current password first.
  if (newPassword !== undefined) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password to change it." },
        { status: 400 }
      );
    }
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 403 }
      );
    }
    update.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await db.update(users).set(update).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  // FK cascades (user_stats, user_progress, user_badges, reaction_cards,
  // pathway_cards, leaderboard_snapshots, …) remove all dependent rows.
  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
