'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { checkRateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
 * Create Supabase client for Server Actions (with cookie handling)
 */
async function createSupabaseClient() {
  return createServerSupabaseClient();
}

/**
 * Get client IP from headers
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
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
 */
export async function signUpAction(
  email: string,
  password: string,
  captchaToken?: string | null
): Promise<AuthResult> {
  const clientIP = await getClientIP();
  const rateLimitResult = checkRateLimit(`signup:${clientIP}`);
  if (!rateLimitResult.success) {
    return { success: false, error: rateLimitResult.error };
  }

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

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  try {
    const supabase = await createSupabaseClient();

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    if (EMAIL_CONFIRMATION_ENABLED) {
      return {
        success: true,
        requiresEmailConfirmation: true,
      };
    }

    if (data.session) {
      return { success: true, requiresEmailConfirmation: false };
    }

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
      error: 'Server configuration error. Please try again later.',
    };
  }
}

/**
 * Server Action: Sign in a user (FormData version for native form action)
 */
export async function signInAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const clientIP = await getClientIP();
  const rateLimitResult = checkRateLimit(`login:${clientIP}`);
  if (!rateLimitResult.success) {
    redirect(`/auth/login?error=${encodeURIComponent(rateLimitResult.error || 'Rate limited')}`);
  }

  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail) {
    redirect('/auth/login?error=' + encodeURIComponent('Email is required'));
  }

  if (!password) {
    redirect('/auth/login?error=' + encodeURIComponent('Password is required'));
  }

  try {
    const supabase = await createSupabaseClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (signInError) {
      console.error('[Login Error]', signInError);
      redirect(`/auth/login?error=${encodeURIComponent(signInError.message)}`);
    }

    redirect('/app');
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    console.error('[Login Exception]', err);
    redirect('/auth/login?error=' + encodeURIComponent('Server configuration error'));
  }
}

/**
 * Server Action: Sign out the current user
 */
export async function signOutAction(): Promise<AuthResult> {
  try {
    const supabase = await createSupabaseClient();

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
      error: 'Server configuration error. Please try again later.',
    };
  }
}
