export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import LeaderboardPage from './LeaderboardPage';

export default async function Leaderboard() {
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

  if (!currentPeriod) {
    return (
      <LeaderboardPage
        userId={user.id}
        leaderboard={[]}
        userRank={null}
        userPoints={0}
        periodName={null}
      />
    );
  }

  // Get leaderboard data (top 100)
  const { data: pointsData } = await supabase
    .from('point_events')
    .select('user_id, points')
    .eq('period_id', currentPeriod.id);

  // Aggregate points per user
  const userPoints: Record<string, number> = {};
  pointsData?.forEach(pe => {
    userPoints[pe.user_id] = (userPoints[pe.user_id] || 0) + pe.points;
  });

  // Get user profiles for the leaderboard
  const userIds = Object.keys(userPoints);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

  // Build leaderboard
  const profileMap: Record<string, { full_name: string | null; email: string }> = {};
  profiles?.forEach(p => {
    profileMap[p.id] = { full_name: p.full_name, email: p.email };
  });

  const leaderboard = Object.entries(userPoints)
    .map(([userId, points]) => ({
      userId,
      points,
      name: profileMap[userId]?.full_name || profileMap[userId]?.email?.split('@')[0] || 'Anonymous',
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 100)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  // Find user's rank
  const userEntry = leaderboard.find(e => e.userId === user.id);
  const currentUserPoints = userPoints[user.id] || 0;

  // If user is not in top 100, calculate their actual rank
  let userRank = userEntry?.rank || null;
  if (!userRank && currentUserPoints > 0) {
    const usersAhead = Object.values(userPoints).filter(p => p > currentUserPoints).length;
    userRank = usersAhead + 1;
  }

  return (
    <LeaderboardPage
      userId={user.id}
      leaderboard={leaderboard}
      userRank={userRank}
      userPoints={currentUserPoints}
      periodName={currentPeriod.period_name}
    />
  );
}
