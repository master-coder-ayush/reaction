import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, userStats, userProgress, reactions } from "@/db/schema";
import { xpForDifficulty } from "@/lib/xp";
import { signupSchema } from "@/lib/validation";
import { levelForXp } from "@/lib/constants";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 5 sign-ups per IP per 10 minutes (Sprint 8 §8.10).
  if (!rateLimit(`signup:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      { status: 429 }
    );
  }

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
    guestProgress = [],
    guestCorrectIds = [],
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

  // Guest XP transfer: recompute XP server-side from the actual difficulty of
  // each reaction the guest attempted. We never trust the XP value from the
  // client — only the reaction id list, which we validate against the DB.
  const today = new Date().toISOString().slice(0, 10);

  let startingXp = 0;
  let validIds: number[] = [];

  // Validate all attempted ids for userProgress seeding.
  if (guestProgress.length > 0) {
    const uniqueIds = Array.from(new Set(guestProgress));
    const existing = await db
      .select({ id: reactions.id })
      .from(reactions)
      .where(inArray(reactions.id, uniqueIds));
    validIds = existing.map((r) => r.id);
  }

  // XP is computed only from correctly answered reactions (separate list).
  if (guestCorrectIds.length > 0) {
    const uniqueCorrectIds = Array.from(new Set(guestCorrectIds));
    const correct = await db
      .select({ id: reactions.id, difficulty: reactions.difficulty })
      .from(reactions)
      .where(inArray(reactions.id, uniqueCorrectIds));
    startingXp = correct.reduce((sum, r) => sum + xpForDifficulty(r.difficulty), 0);
  }

  await db.insert(userStats).values({
    userId,
    xp: startingXp,
    level: levelForXp(startingXp),
    streakCurrent: 1,
    streakLongest: 1,
    lastActivityDate: today,
    totalAttempts: guestProgress.length,
  });

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

  return NextResponse.json({ ok: true, username, transferredXp: startingXp });
}
