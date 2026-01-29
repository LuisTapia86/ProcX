import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth callback handler for email confirmation flow.
 * Only used when NEXT_PUBLIC_ENABLE_EMAIL_CONFIRMATION=true
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[Auth Callback Error]', error);
  }

  // Redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
