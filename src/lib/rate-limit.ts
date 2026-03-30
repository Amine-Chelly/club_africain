type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Simple sliding-window rate limiter (in-memory; use Redis in multi-instance production). */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) };
  }
  b.count += 1;
  return { ok: true };
}

export function clientKey(ip: string | null, route: string) {
  return `${ip ?? "unknown"}:${route}`;
}
