export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createServerSupabaseClient } from '@/lib/supabase/server';
import AppDashboard from './AppDashboard';

export default async function AppPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth is enforced by layout.tsx, but TypeScript needs the check
  if (!user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  // Get active challenges
  const { data: activeChallenges } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge_catalog (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Get current period
  const { data: currentPeriod } = await supabase
    .from('reward_periods')
    .select('*')
    .eq('status', 'active')
    .single();

  // Get user's monthly points
  let monthlyPoints = 0;
  if (currentPeriod) {
    const { data: points } = await supabase
      .from('point_events')
      .select('points')
      .eq('user_id', user.id)
      .eq('period_id', currentPeriod.id);

    monthlyPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;
  }

  return (
    <AppDashboard
      profile={profile}
      subscription={subscription}
      activeChallenges={activeChallenges || []}
      currentPeriod={currentPeriod}
      monthlyPoints={monthlyPoints}
    />
  );
}
