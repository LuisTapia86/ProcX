/**
 * Security utilities for auth protection.
 * These are optional hooks - enable in production as needed.
 */

// ======================
// CAPTCHA (Optional)
// ======================
// Set these env vars to enable:
// - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
// - RECAPTCHA_SECRET_KEY

export const CAPTCHA_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
  process.env.RECAPTCHA_SECRET_KEY
);

/**
 * Verify reCAPTCHA token server-side.
 * Returns true if CAPTCHA is disabled or verification passes.
 */
export async function verifyCaptcha(token: string | null): Promise<boolean> {
  if (!CAPTCHA_ENABLED) return true;
  if (!token) return false;

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('[CAPTCHA Verification Error]', error);
    return false;
  }
}

// ======================
// RATE LIMITING
// ======================
// Uses the rate_limits table in Supabase (already defined in schema)

export interface RateLimitConfig {
  maxRequests: number;  // Max requests per window
  windowMs: number;     // Window size in milliseconds
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints - strict limits
  'auth/signup': { maxRequests: 5, windowMs: 60 * 60 * 1000 },    // 5 per hour
  'auth/login': { maxRequests: 10, windowMs: 15 * 60 * 1000 },    // 10 per 15 min
  'auth/logout': { maxRequests: 20, windowMs: 60 * 1000 },        // 20 per minute

  // API endpoints - moderate limits
  'api/checkin': { maxRequests: 100, windowMs: 60 * 1000 },       // 100 per minute
  'api/default': { maxRequests: 60, windowMs: 60 * 1000 },        // 60 per minute
};

/**
 * Check if request should be rate limited.
 * Note: Actual implementation uses the rate_limits table in Supabase.
 * This is a stub - implement with your Supabase client in API routes.
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  return RATE_LIMITS[endpoint] || RATE_LIMITS['api/default'];
}

// ======================
// PASSWORD POLICY
// ======================

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Optional: Add more rules for production
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ======================
// SECURITY HEADERS
// ======================

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
