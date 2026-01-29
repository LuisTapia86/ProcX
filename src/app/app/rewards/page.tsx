import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import RewardsPage from './RewardsPage';

export default async function Rewards() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get current period
  const { data: currentPeriod } = await supabase
    .from('reward_periods')
    .select('*')
    .eq('status', 'active')
    .single();

  // Get past periods with winners
  const { data: pastPeriods } = await supabase
    .from('reward_periods')
    .select(`
      *,
      winners (
        *,
        profiles (full_name, email)
      )
    `)
    .in('status', ['closed', 'paid'])
    .order('end_date', { ascending: false })
    .limit(5);

  // Check if user has pending prizes
  const { data: userWins } = await supabase
    .from('winners')
    .select('*')
    .eq('user_id', user.id)
    .eq('payout_status', 'pending');

  return (
    <RewardsPage
      currentPeriod={currentPeriod}
      pastPeriods={pastPeriods || []}
      pendingPrizes={userWins || []}
    />
  );
}
