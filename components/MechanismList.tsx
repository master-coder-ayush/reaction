"use client";

import { useState } from "react";
import { Puzzle, Target } from "lucide-react";
import { MechanismSession } from "@/components/MechanismSession";
import { Button } from "@/components/ui/button";
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
      <div className="card-soft p-6 text-center">
        <span className="icon-chip mx-auto" aria-hidden><Puzzle className="h-6 w-6" /></span>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">No mechanisms yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This chapter doesn&apos;t have drag-and-drop mechanisms yet.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card-soft p-6 text-center">
        <span className="icon-chip mx-auto" aria-hidden><Target className="h-6 w-6" /></span>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">Mechanisms complete!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You worked through all {mechanisms.length} mechanism
          {mechanisms.length === 1 ? "" : "s"} in this chapter.
        </p>
        <Button
          type="button"
          onClick={() => {
            setIndex(0);
            setDone(false);
          }}
          className="mt-5"
        >
          Practice again
        </Button>
      </div>
    );
  }

  const hasNext = index + 1 < mechanisms.length;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-muted-foreground">
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
