"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reagents…"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No reagents match “{q}”.
        </p>
      ) : (
        <div className="space-y-5">
          {filtered.map((section) => (
            <div key={section.key}>
              <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-info-border">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.entries.map((e) => (
                  <li
                    key={e.reagent}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-soft"
                  >
                    <span
                      className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: reactionColorVar(e.color) }}
                    />
                    <div>
                      <span className="font-bold">{e.reagent}</span>
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
