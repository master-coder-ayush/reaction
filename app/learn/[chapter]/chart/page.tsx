import Link from "next/link";
import { ConversionChart } from "@/components/ConversionChart";
import { loadConversionChart } from "@/lib/practice";
import { CHAPTERS } from "@/lib/constants";

// /learn/[chapter]/chart (Sprint 8 §8.5). Printable conversion chart — minimal
// chrome (no nav) so it prints cleanly as a study aid. Public.

export const metadata = {
  title: "Conversion Chart",
};

export default async function ChartPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  const chapterMeta = CHAPTERS.find((c) => c.id === chapterId);

  const { categoryName, rows } =
    Number.isInteger(chapterId) && chapterId >= 1
      ? await loadConversionChart(chapterId)
      : { categoryName: null, rows: [] };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 print:py-2">
      <div className="mb-4 print:hidden">
        <Link
          href={`/learn/${chapterId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {chapterMeta?.name ?? "Chapter"}
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        {chapterMeta?.name ?? categoryName ?? "Conversion Chart"}
      </h1>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">
        Functional-group conversions — From → Reagent → To.
      </p>

      <ConversionChart rows={rows} />

      <p className="mt-4 text-xs text-muted-foreground print:hidden">
        Tip: use your browser&apos;s print (Ctrl/Cmd+P) to save this chart.
      </p>
    </main>
  );
}
