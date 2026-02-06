import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createServerSupabaseClient() {
  // Try NEXT_PUBLIC_ first, fallback to non-prefixed
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

  // TEMP: Debug logging for Vercel
  console.error('[ENV CHECK]', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)');
    console.error('[Supabase] Missing environment variables:', missing.join(', '));
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Can't set cookies in Server Components (read-only context)
            }
          });
        },
      },
    }
  );
}

// Service role client for admin operations
export function createServiceRoleClient() {
  // Try NEXT_PUBLIC_ first, fallback to non-prefixed
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)');
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    console.error('[Supabase] Missing environment variables:', missing.join(', '));
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
