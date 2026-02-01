export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    '';
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    '';
  return { url, anon };
}

export function validateSupabaseEnv(): { url: string; anon: string } {
  const { url, anon } = getSupabaseEnv();

  if (!url || !anon) {
    console.error('SUPABASE_ENV_STATUS', {
      hasUrl: !!url,
      hasAnon: !!anon,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      keysPresent: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      },
    });
    throw new Error('Supabase env missing (see SUPABASE_ENV_STATUS in logs)');
  }

  return { url, anon };
}
