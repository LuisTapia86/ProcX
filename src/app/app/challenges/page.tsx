import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ChallengesPage from './ChallengesPage';

export default async function Challenges() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  // Get all active challenges from catalog
  const { data: catalog } = await supabase
    .from('challenge_catalog')
    .select('*')
    .eq('is_active', true)
    .order('difficulty');

  // Get user's challenges
  const { data: userChallenges } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge_catalog (*)
    `)
    .eq('user_id', user.id);

  // Get today's check-ins
  const today = new Date().toISOString().split('T')[0];
  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('user_challenge_id')
    .eq('user_id', user.id)
    .eq('checkin_date', today);

  const checkedInChallenges = new Set(todayCheckins?.map(c => c.user_challenge_id) || []);

  return (
    <ChallengesPage
      userId={user.id}
      hasSubscription={subscription?.status === 'active'}
      catalog={catalog || []}
      userChallenges={userChallenges || []}
      checkedInChallenges={checkedInChallenges}
    />
  );
}
