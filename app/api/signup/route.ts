import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, userStats, userProgress, reactions } from "@/db/schema";
import { signupSchema } from "@/lib/validation";
import { levelForXp } from "@/lib/constants";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const {
    name,
    username,
    email,
    phone,
    password,
    classLevel,
    guestXp = 0,
    guestProgress = [],
  } = parsed.data;

  // Pre-check for friendly duplicate errors (unique indexes are the real guard).
  const [dupeUsername] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (dupeUsername) {
    return NextResponse.json(
      { error: "That username is taken.", field: "username" },
      { status: 409 }
    );
  }

  const [dupeEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (dupeEmail) {
    return NextResponse.json(
      { error: "An account with that email already exists.", field: "email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let userId: number;
  try {
    const [created] = await db
      .insert(users)
      .values({ name, username, email, phone, passwordHash, classLevel })
      .returning({ id: users.id });
    userId = created.id;
  } catch (err) {
    // Unique-index violation slipped past the pre-check (race condition).
    console.error("signup insert failed", err);
    return NextResponse.json(
      { error: "Could not create account. Username or email may be taken." },
      { status: 409 }
    );
  }

  // Guest XP transfer: credit accumulated session XP and seed streak at 1 day
  // (the act of signing up + carrying progress counts as today's activity).
  const today = new Date().toISOString().slice(0, 10);
  const startingXp = Math.max(0, Math.floor(guestXp));

  await db.insert(userStats).values({
    userId,
    xp: startingXp,
    level: levelForXp(startingXp),
    streakCurrent: 1,
    streakLongest: 1,
    lastActivityDate: today,
    totalAttempts: guestProgress.length,
  });

  // Mark guest-attempted reactions so the student isn't asked to repeat them.
  // Filter to reaction ids that actually exist (the list comes from the client's
  // localStorage and could be stale or tampered with — avoid an FK violation).
  if (guestProgress.length > 0) {
    const uniqueReactionIds = Array.from(new Set(guestProgress));
    const existing = await db
      .select({ id: reactions.id })
      .from(reactions)
      .where(inArray(reactions.id, uniqueReactionIds));
    const validIds = existing.map((r) => r.id);

    if (validIds.length > 0) {
      await db
        .insert(userProgress)
        .values(
          validIds.map((reactionId) => ({
            userId,
            reactionId,
            attempts: 1,
            lastAttempted: new Date(),
          }))
        )
        .onConflictDoNothing();
    }
  }

  return NextResponse.json({ ok: true, username, transferredXp: startingXp });
}
