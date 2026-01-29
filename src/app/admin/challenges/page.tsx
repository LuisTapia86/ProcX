import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminChallengesPage from './AdminChallengesPage';

export default async function AdminChallenges() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/app');
  }

  // Get all challenges
  const { data: challenges } = await supabase
    .from('challenge_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  return <AdminChallengesPage challenges={challenges || []} />;
}
