import "server-only";

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const INTERVAL_MS = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, INTERVAL_MS).unref?.();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(ip, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, limit, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function extractIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    "127.0.0.1"
  );
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export interface RateLimitCheckResult {
  blocked: boolean;
  response: NextResponse | null;
  headers: Record<string, string>;
}

export function checkRateLimit(
  request: NextRequest,
  options?: RateLimitOptions
): RateLimitCheckResult {
  const limit = options?.limit ?? 10;
  const windowMs = options?.windowMs ?? 60_000;
  const ip = extractIp(request);
  const result = rateLimit(ip, limit, windowMs);
  const headers = rateLimitHeaders(result);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      blocked: true,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter > 0 ? retryAfter : 1),
            ...headers,
          },
        }
      ),
      headers,
    };
  }

  return { blocked: false, response: null, headers };
}

export function withRateLimit(
  request: NextRequest,
  options?: RateLimitOptions
): NextResponse | null {
  const { blocked, response } = checkRateLimit(request, options);
  return blocked ? response : null;
}
