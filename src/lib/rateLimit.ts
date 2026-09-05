/**
 * Minimal in-memory rate limiter for auth-sensitive routes (register,
 * forgot-password, contact form). Good enough for a single server instance.
 *
 * IMPORTANT: this resets on deploy/restart and does NOT share state across
 * multiple server instances. For a multi-instance production deployment,
 * replace this with a shared store (e.g. Upstash Redis / @upstash/ratelimit)
 * keyed the same way.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || "unknown";
}
