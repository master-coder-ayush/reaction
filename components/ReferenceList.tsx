"use client";

import { useMemo, useState } from "react";
import { reactionColorVar } from "@/lib/constants";
import type { ReferenceSection } from "@/lib/reference";

// ReferenceList (Sprint 8 §8.3–8.4). Renders reagent classification sections,
// color-coded by reaction type, with an optional search box. Shared by the
// full /reference page and the in-question drawer.

export function ReferenceList({
  sections,
  searchable = true,
}: {
  sections: ReferenceSection[];
  searchable?: boolean;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sections;
    return sections
      .map((s) => ({
        ...s,
        entries: s.entries.filter(
          (e) =>
            e.reagent.toLowerCase().includes(needle) ||
            e.note.toLowerCase().includes(needle) ||
            s.title.toLowerCase().includes(needle)
        ),
      }))
      .filter((s) => s.entries.length > 0);
  }, [q, sections]);

  return (
    <div>
      {searchable && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reagents…"
          className="mb-4 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No reagents match “{q}”.
        </p>
      ) : (
        <div className="space-y-5">
          {filtered.map((section) => (
            <div key={section.key}>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.entries.map((e) => (
                  <li
                    key={e.reagent}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span
                      className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: reactionColorVar(e.color) }}
                    />
                    <div>
                      <span className="font-semibold">{e.reagent}</span>
                      <p className="text-sm text-muted-foreground">{e.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
