// Pure, client-safe session-selection helpers (Sprint 3 §3.1). Kept separate
// from lib/practice.ts so the client bundle never imports the server-only DB
// module. The page's RSC loader lives in lib/practice.ts.

export const SESSION_SIZE = 10;

/**
 * Draw up to `size` questions from `pool`, weighted toward reactions the user
 * has answered fewer times (weight = 1 / (attempts + 1)). Empty `attemptsById`
 * → effectively uniform random. Pure + testable; pass a seeded `rng` in tests.
 */
export function pickSession<T extends { id: number }>(
  pool: T[],
  attemptsById: Record<number, number>,
  size = SESSION_SIZE,
  rng: () => number = Math.random
): T[] {
  const remaining = [...pool];
  const chosen: T[] = [];
  const target = Math.min(size, remaining.length);

  while (chosen.length < target && remaining.length > 0) {
    const weights = remaining.map((r) => 1 / ((attemptsById[r.id] ?? 0) + 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      roll -= weights[idx];
      if (roll <= 0) break;
    }
    if (idx >= remaining.length) idx = remaining.length - 1;
    chosen.push(remaining.splice(idx, 1)[0]);
  }

  return chosen;
}
