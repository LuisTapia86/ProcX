'use server';

// Force Node.js runtime for Server Actions
export const runtime = 'nodejs';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

// Server-only config - never exposed to client
const EMAIL_CONFIRMATION_ENABLED = process.env.ENABLE_EMAIL_CONFIRMATION === 'true';
const CAPTCHA_ENABLED = process.env.ENABLE_CAPTCHA === 'true';
const CAPTCHA_SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
const CAPTCHA_VERIFY_URL = process.env.CAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify';

export interface AuthResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

/**
 * Get client IP from headers
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  // Check common headers for real IP (behind proxy/load balancer)
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Verify CAPTCHA token server-side
 */
async function verifyCaptcha(token: string | null): Promise<{ success: boolean; error?: string }> {
  // Skip if CAPTCHA is disabled
  if (!CAPTCHA_ENABLED) {
    return { success: true };
  }

  if (!CAPTCHA_SECRET_KEY) {
    console.error('[CAPTCHA] Secret key not configured');
    return { success: false, error: 'CAPTCHA not configured' };
  }

  if (!token) {
    return { success: false, error: 'Please complete the CAPTCHA' };
  }

  try {
    const response = await fetch(CAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: CAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    console.error('[CAPTCHA] Verification failed:', data['error-codes']);
    return { success: false, error: 'CAPTCHA verification failed' };
  } catch (err) {
    console.error('[CAPTCHA] Exception:', err);
    return { success: false, error: 'CAPTCHA verification error' };
  }
}

/**
 * Server Action: Sign up a new user
 * Handles rate limiting, CAPTCHA, and email confirmation logic server-side
 */
export async function signUpAction(
  email: string,
  password: string,
  captchaToken?: string | null
): Promise<AuthResult> {
  // Rate limit check (by IP + action)
  const clientIP = await getClientIP();
  const rateLimitResult = checkRateLimit(`signup:${clientIP}`);
  if (!rateLimitResult.success) {
    console.warn('[Rate Limit] Signup blocked for IP:', clientIP);
    return { success: false, error: rateLimitResult.error };
  }

  // Verify CAPTCHA (if enabled)
  const captchaResult = await verifyCaptcha(captchaToken ?? null);
  if (!captchaResult.success) {
    return { success: false, error: captchaResult.error };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Server-side validation
  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' };
  }

  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  try {
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch (envError) {
      const errMsg = envError instanceof Error ? envError.message : String(envError);
      console.error('[Signup] Supabase client error:', errMsg);
      return { success: false, error: 'Server configuration error. Please try again later.' };
    }

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create user account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: EMAIL_CONFIRMATION_ENABLED
        ? { emailRedirectTo: `${origin}/auth/callback` }
        : undefined,
    });

    if (signUpError) {
      console.error('[Signup Error]', signUpError);
      return { success: false, error: signUpError.message };
    }

    // If email confirmation is required
    if (EMAIL_CONFIRMATION_ENABLED) {
      return {
        success: true,
        requiresEmailConfirmation: true,
      };
    }

    // No email confirmation - check if we got a session
    if (data.session) {
      return { success: true, requiresEmailConfirmation: false };
    }

    // No session returned - try auto-login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInError) {
      console.error('[Auto-login Error]', signInError);
      return { success: false, error: signInError.message };
    }

    return { success: true, requiresEmailConfirmation: false };
  } catch (err) {
    console.error('[Signup Exception]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Sign in a user
 */
export async function signInAction(
  email: string,
  password: string,
  captchaToken?: string | null
): Promise<AuthResult> {
  // Rate limit check (by IP + action)
  const clientIP = await getClientIP();
  const rateLimitResult = checkRateLimit(`login:${clientIP}`);
  if (!rateLimitResult.success) {
    console.warn('[Rate Limit] Login blocked for IP:', clientIP);
    return { success: false, error: rateLimitResult.error };
  }

  // Verify CAPTCHA (if enabled)
  const captchaResult = await verifyCaptcha(captchaToken ?? null);
  if (!captchaResult.success) {
    return { success: false, error: captchaResult.error };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, error: 'Email is required' };
  }

  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  try {
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch (envError) {
      const errMsg = envError instanceof Error ? envError.message : String(envError);
      console.error('[Login] Supabase client error:', errMsg);
      return { success: false, error: 'Server configuration error. Please try again later.' };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInError) {
      console.error('[Login Error]', signInError);
      return { success: false, error: signInError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Login Exception]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Server Action: Sign out the current user
 */
export async function signOutAction(): Promise<AuthResult> {
  try {
    let supabase;
    try {
      supabase = await createServerSupabaseClient();
    } catch (envError) {
      const errMsg = envError instanceof Error ? envError.message : String(envError);
      console.error('[Logout] Supabase client error:', errMsg);
      return { success: false, error: 'Server configuration error. Please try again later.' };
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Logout Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Logout Exception]', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
}
