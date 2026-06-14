import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
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
    <Link href={`/learn`} className="group block">
      <Card accent="blue" hover>
        <div className="flex items-center gap-3">
          <span
            className="icon-chip bg-secondary-soft text-secondary-border"
            aria-hidden
          >
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Continue where you left off
            </div>
            <div className="mt-0.5 truncate text-base font-extrabold tracking-tight">
              Chapter {chapterId}: {chapterName}
            </div>
          </div>
          <ArrowRight
            aria-hidden
            className="h-5 w-5 shrink-0 text-secondary transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </Card>
    </Link>
  );
}
