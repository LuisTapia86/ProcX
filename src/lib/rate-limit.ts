/**
 * Simple in-memory rate limiter for auth endpoints.
 * For multi-instance deployments, use the rate_limits table in Supabase instead.
 */

const RATE_LIMIT_ENABLED = process.env.ENABLE_RATE_LIMIT === 'true';

// Limits
const MINUTE_LIMIT = 5;   // 5 attempts per minute
const HOUR_LIMIT = 20;    // 20 attempts per hour

// Windows in milliseconds
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

interface RateLimitEntry {
  minuteCount: number;
  minuteReset: number;
  hourCount: number;
  hourReset: number;
}

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.hourReset) {
      store.delete(key);
    }
  });
}, 5 * MINUTE_MS);

export interface RateLimitResult {
  success: boolean;
  error?: string;
  retryAfter?: number; // seconds
}

/**
 * Check rate limit for an identifier (usually IP or IP+action)
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  // Skip if rate limiting is disabled
  if (!RATE_LIMIT_ENABLED) {
    return { success: true };
  }

  const now = Date.now();
  let entry = store.get(identifier);

  // Initialize or reset expired windows
  if (!entry) {
    entry = {
      minuteCount: 0,
      minuteReset: now + MINUTE_MS,
      hourCount: 0,
      hourReset: now + HOUR_MS,
    };
  } else {
    // Reset minute window if expired
    if (now > entry.minuteReset) {
      entry.minuteCount = 0;
      entry.minuteReset = now + MINUTE_MS;
    }
    // Reset hour window if expired
    if (now > entry.hourReset) {
      entry.hourCount = 0;
      entry.hourReset = now + HOUR_MS;
    }
  }

  // Check limits
  if (entry.minuteCount >= MINUTE_LIMIT) {
    const retryAfter = Math.ceil((entry.minuteReset - now) / 1000);
    return {
      success: false,
      error: 'Too many attempts. Please wait a moment and try again.',
      retryAfter,
    };
  }

  if (entry.hourCount >= HOUR_LIMIT) {
    const retryAfter = Math.ceil((entry.hourReset - now) / 1000);
    return {
      success: false,
      error: 'Too many attempts. Please try again later.',
      retryAfter,
    };
  }

  // Increment counters
  entry.minuteCount++;
  entry.hourCount++;
  store.set(identifier, entry);

  return { success: true };
}

/**
 * Get rate limit status (for headers/debugging)
 */
export function getRateLimitStatus(identifier: string): {
  minuteRemaining: number;
  hourRemaining: number;
} {
  if (!RATE_LIMIT_ENABLED) {
    return { minuteRemaining: MINUTE_LIMIT, hourRemaining: HOUR_LIMIT };
  }

  const entry = store.get(identifier);
  if (!entry) {
    return { minuteRemaining: MINUTE_LIMIT, hourRemaining: HOUR_LIMIT };
  }

  const now = Date.now();
  const minuteRemaining = now > entry.minuteReset ? MINUTE_LIMIT : Math.max(0, MINUTE_LIMIT - entry.minuteCount);
  const hourRemaining = now > entry.hourReset ? HOUR_LIMIT : Math.max(0, HOUR_LIMIT - entry.hourCount);

  return { minuteRemaining, hourRemaining };
}
