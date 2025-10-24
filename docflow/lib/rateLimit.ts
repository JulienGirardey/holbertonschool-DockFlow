import { NextRequest, NextResponse } from "next/server";

/**
 * Simple rate limiter with in-memory fallback.
 * - Use for MVP. Not suitable for multi-instance production (use Redis/Upstash there).
 * - Returns a NextResponse when limited, otherwise null.
 */

const memoryStore = new Map<string, number[]>();

export async function rateLimit(
  req: NextRequest,
  keyPrefix: string,
  limit = 60,
  windowSeconds = 60
): Promise<NextResponse | null> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const key = `${keyPrefix}:${ip}`;

  const timestamps = (memoryStore.get(key) ?? []).filter((ts) => ts > now - windowMs);

  if (timestamps.length >= limit) {
    // oldest timestamp still in window
    const oldest = Math.min(...timestamps);
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  // record this hit
  timestamps.push(now);
  memoryStore.set(key, timestamps);

  return null;
}