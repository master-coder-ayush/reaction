"use client";

import { useState } from "react";
import { MechanismSession } from "@/components/MechanismSession";
import type { MechanismDTO } from "@/lib/mechanism";

// MechanismList (Sprint 7 §7.1). Walks the chapter's mechanisms one at a time:
// plays MechanismSession, advances on "Next", and shows a wrap-up after the last.

export function MechanismList({
  mechanisms,
  isGuest,
}: {
  mechanisms: MechanismDTO[];
  isGuest: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  if (mechanisms.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="text-3xl">🧩</div>
        <h2 className="mt-2 text-lg font-semibold">No mechanisms yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This chapter doesn&apos;t have drag-and-drop mechanisms yet.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="text-4xl">🎯</div>
        <h2 className="mt-2 text-lg font-bold">Mechanisms complete!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You worked through all {mechanisms.length} mechanism
          {mechanisms.length === 1 ? "" : "s"} in this chapter.
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setDone(false);
          }}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Practice again
        </button>
      </div>
    );
  }

  const hasNext = index + 1 < mechanisms.length;

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Mechanism {index + 1} of {mechanisms.length}
      </p>
      <MechanismSession
        key={mechanisms[index].id}
        mechanism={mechanisms[index]}
        isGuest={isGuest}
        hasNext={hasNext}
        onNext={() => (hasNext ? setIndex((i) => i + 1) : setDone(true))}
      />
    </div>
  );
}
