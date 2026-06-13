import Link from "next/link";
import { Card } from "@/components/ui/card";

/**
 * "Continue where you left off" card (Sprint 2 §2.2). Links to the user's next
 * incomplete chapter. The chapter resolution is stubbed for now (Sprint 5 adds
 * real progress/boss gating) — defaults to chapter 1.
 */
export function ContinueCard({
  chapterId,
  chapterName,
}: {
  chapterId: number;
  chapterName: string;
}) {
  return (
    <Link href={`/learn`} className="block">
      <Card className="transition-colors hover:border-primary">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Continue where you left off
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-semibold">
            Chapter {chapterId}: {chapterName}
          </span>
          <span aria-hidden className="text-primary">
            →
          </span>
        </div>
      </Card>
    </Link>
  );
}
