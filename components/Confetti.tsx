"use client";

import { useEffect, useState } from "react";

// Lightweight CSS confetti burst (no extra dependency — Sprint 3 §3.1 allows
// canvas-confetti OR custom CSS; we keep the bundle lean with CSS). Render this
// conditionally on a correct answer; it auto-fades via the `confetti-fall`
// keyframes in globals.css. Remount with a changing `key` to replay it.

const COLORS = [
  "var(--reaction-addition)",
  "var(--reaction-substitution)",
  "var(--reaction-elimination)",
  "var(--reaction-oxidation)",
  "var(--reaction-reduction)",
  "var(--reaction-electrophilic)",
];

const PIECES = 28;

type Piece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  rotate: number;
};

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  // Randomize once after mount — keeping Math.random out of render keeps the
  // component pure (React purity rule) and avoids hydration mismatches.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(
      Array.from({ length: PIECES }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 80,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      }))
    );
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rot": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
