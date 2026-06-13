import { type NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { usernameSchema } from "@/lib/validation";

// GET /api/check-username?u=aryan_chem
// -> { available: boolean, reason?: string }
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("u") ?? "";

  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Invalid username.",
    });
  }

  const username = parsed.data;
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return NextResponse.json({
    available: !existing,
    reason: existing ? "That username is taken." : undefined,
  });
}
