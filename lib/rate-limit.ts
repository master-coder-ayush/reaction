// ---------------------------------------------------------------------------
// Minimal in-memory rate limiter (Sprint 8 §8.10). A fixed-window counter keyed
// by an arbitrary string (e.g. "signup:1.2.3.4"). Good enough for a single
// serverless instance / low traffic; swap for Vercel KV if horizontal scaling
// is needed. Not security-critical — just throttles abuse of signup/login.
// ---------------------------------------------------------------------------

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

/**
 * Returns `true` if the action is allowed (under the limit) and records the hit;
 * `false` if the limit for the current window is exceeded.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

/** Best-effort client IP from a request's forwarded headers. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
