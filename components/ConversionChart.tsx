import { reactionColorVar } from "@/lib/constants";
import type { ConversionRow } from "@/lib/practice";

// ConversionChart (Sprint 8 §8.5). Functional-group conversion table for a
// chapter: From → Reagent → To, colour-coded by reaction type. Server component
// (no interactivity) — reused on the chapter overview and the printable page.

export function ConversionChart({ rows }: { rows: ConversionRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
        No conversions for this chapter yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2.5 font-semibold">From</th>
            <th className="px-4 py-2.5 font-semibold">Reagent</th>
            <th className="px-4 py-2.5 font-semibold">To</th>
            <th className="px-4 py-2.5 font-semibold">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const color = reactionColorVar(r.typeColor);
            return (
              <tr key={r.reactionId}>
                <td className="px-4 py-2.5 font-medium">{r.from ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  {r.reagent ?? "—"}
                </td>
                <td className="px-4 py-2.5 font-medium">{r.to ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      color,
                      backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                    }}
                  >
                    {r.typeName}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
