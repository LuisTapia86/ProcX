import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Logout Error]', error);
    }
  } catch (err) {
    console.error('[Logout Exception]', err);
  }

  return NextResponse.redirect(new URL('/auth/login', APP_URL), {
    status: 302,
  });
}

export async function GET() {
  // Support GET for convenience (link clicks)
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Logout Error]', error);
    }
  } catch (err) {
    console.error('[Logout Exception]', err);
  }

  return NextResponse.redirect(new URL('/auth/login', APP_URL), {
    status: 302,
  });
}
