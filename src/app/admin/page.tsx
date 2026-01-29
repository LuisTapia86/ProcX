import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
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

  // Get stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get current period
  const { data: currentPeriod } = await supabase
    .from('reward_periods')
    .select('*')
    .eq('status', 'active')
    .single();

  // Get recent subscriptions for revenue calculation
  const subscriptionPrice = 99; // MXN
  const totalRevenue = (activeSubscribers || 0) * subscriptionPrice;
  const creatorFee = totalRevenue * 0.2;
  const rewardPool = totalRevenue * 0.8;

  return (
    <AdminDashboard
      totalUsers={totalUsers || 0}
      activeSubscribers={activeSubscribers || 0}
      totalRevenue={totalRevenue}
      creatorFee={creatorFee}
      rewardPool={currentPeriod?.reward_pool_mxn || rewardPool}
      currentPeriod={currentPeriod}
    />
  );
}
