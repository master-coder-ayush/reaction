import { NextResponse } from "next/server";
import { referenceForChapter } from "@/lib/reference";

// GET /api/reference/chapter/[id] (Sprint 8 §8.4). Returns the reagent reference
// sections most relevant to a chapter, for the in-question drawer. Public.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chapterId = Number(id);
  if (!Number.isInteger(chapterId) || chapterId < 1) {
    return NextResponse.json({ error: "Invalid chapter." }, { status: 400 });
  }
  return NextResponse.json({ sections: referenceForChapter(chapterId) });
}
