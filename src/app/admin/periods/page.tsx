import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminPeriodsPage from './AdminPeriodsPage';

export default async function AdminPeriods() {
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

  // Get all periods
  const { data: periods } = await supabase
    .from('reward_periods')
    .select(`
      *,
      winners (
        id,
        user_id,
        rank,
        total_points,
        prize_amount_mxn,
        payout_status,
        profiles (full_name, email)
      )
    `)
    .order('start_date', { ascending: false });

  // Get active subscribers count
  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return (
    <AdminPeriodsPage
      periods={periods || []}
      activeSubscribers={activeSubscribers || 0}
    />
  );
}
