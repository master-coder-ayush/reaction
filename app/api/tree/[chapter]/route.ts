import { NextResponse } from "next/server";
import { loadTree } from "@/lib/tree";

// GET /api/tree/[chapter] — the Visual Reaction Tree for a chapter (Sprint 6
// §6.3), where [chapter] is the category order_index. Returns nodes + edges +
// chapter reactions for the node mini-panels. Public: trees are available to
// guests with no auth.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapter: string }> }
) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  if (!Number.isInteger(chapterId) || chapterId < 1) {
    return NextResponse.json({ error: "Invalid chapter." }, { status: 400 });
  }

  const tree = await loadTree(chapterId);
  return NextResponse.json(tree);
}
