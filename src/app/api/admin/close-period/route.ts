import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Prize distribution percentages
const PRIZE_DISTRIBUTION = {
  3: [50, 30, 20],
  5: [35, 25, 18, 12, 10],
  10: [25, 18, 14, 11, 9, 7, 6, 5, 3, 2],
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    // Get current user and verify admin
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { periodId } = await request.json();

    if (!periodId) {
      return NextResponse.json({ error: 'periodId is required' }, { status: 400 });
    }

    // Get the period
    const { data: period } = await supabase
      .from('reward_periods')
      .select('*')
      .eq('id', periodId)
      .eq('status', 'active')
      .single();

    if (!period) {
      return NextResponse.json({ error: 'Active period not found' }, { status: 404 });
    }

    // Get all points for this period, aggregated by user
    const { data: pointsData } = await supabase
      .from('point_events')
      .select('user_id, points')
      .eq('period_id', periodId);

    // Aggregate points per user
    const userPoints: Record<string, number> = {};
    pointsData?.forEach(pe => {
      userPoints[pe.user_id] = (userPoints[pe.user_id] || 0) + pe.points;
    });

    // Create leaderboard
    const leaderboard = Object.entries(userPoints)
      .map(([userId, points]) => ({ userId, points }))
      .sort((a, b) => b.points - a.points);

    if (leaderboard.length === 0) {
      return NextResponse.json({ error: 'No participants found' }, { status: 400 });
    }

    // Determine number of winners based on pool
    const pool = period.reward_pool_mxn;
    let winnerCount: 3 | 5 | 10;
    if (pool < 5000) {
      winnerCount = 3;
    } else if (pool < 20000) {
      winnerCount = 5;
    } else {
      winnerCount = 10;
    }

    // Cap winners to available participants
    const actualWinnerCount = Math.min(winnerCount, leaderboard.length);
    const distribution = PRIZE_DISTRIBUTION[winnerCount].slice(0, actualWinnerCount);

    // Normalize distribution if we have fewer winners
    if (actualWinnerCount < winnerCount) {
      const total = distribution.reduce((a, b) => a + b, 0);
      const factor = 100 / total;
      distribution.forEach((_, i) => {
        distribution[i] = Math.round(distribution[i] * factor * 100) / 100;
      });
    }

    // Generate winners with tie-breaking
    const winners = [];
    let currentRank = 1;
    let i = 0;

    while (i < actualWinnerCount && i < leaderboard.length) {
      const currentPoints = leaderboard[i].points;

      // Find all users with the same points (ties)
      const tiedUsers = [leaderboard[i]];
      let j = i + 1;
      while (j < leaderboard.length && leaderboard[j].points === currentPoints) {
        tiedUsers.push(leaderboard[j]);
        j++;
      }

      if (tiedUsers.length > 1 && currentRank <= actualWinnerCount) {
        // Need tie-breaking
        const seed = `${periodId}-${currentPoints}-${Date.now()}`;
        const hash = crypto.createHash('sha256').update(seed).digest('hex');

        // Sort by hash for deterministic random order
        tiedUsers.sort((a, b) => {
          const hashA = crypto.createHash('sha256').update(seed + a.userId).digest('hex');
          const hashB = crypto.createHash('sha256').update(seed + b.userId).digest('hex');
          return hashA.localeCompare(hashB);
        });

        for (const user of tiedUsers) {
          if (currentRank <= actualWinnerCount) {
            const percentage = distribution[currentRank - 1] || 0;
            const prizeAmount = Math.round(pool * percentage / 100 * 100) / 100;

            winners.push({
              period_id: periodId,
              user_id: user.userId,
              rank: currentRank,
              total_points: user.points,
              prize_percentage: percentage,
              prize_amount_mxn: prizeAmount,
              tie_break_used: true,
              tie_break_seed: seed,
              payout_status: 'pending',
            });
            currentRank++;
          }
        }
      } else {
        // No tie
        if (currentRank <= actualWinnerCount) {
          const percentage = distribution[currentRank - 1] || 0;
          const prizeAmount = Math.round(pool * percentage / 100 * 100) / 100;

          winners.push({
            period_id: periodId,
            user_id: tiedUsers[0].userId,
            rank: currentRank,
            total_points: tiedUsers[0].points,
            prize_percentage: percentage,
            prize_amount_mxn: prizeAmount,
            tie_break_used: false,
            tie_break_seed: null,
            payout_status: 'pending',
          });
          currentRank++;
        }
      }

      i = j;
    }

    // Insert winners
    const { error: winnersError } = await serviceClient
      .from('winners')
      .insert(winners);

    if (winnersError) {
      console.error('Winners insert error:', winnersError);
      return NextResponse.json({ error: 'Failed to insert winners' }, { status: 500 });
    }

    // Update period status
    await serviceClient
      .from('reward_periods')
      .update({
        status: 'closed',
        winner_count: winners.length,
        closed_at: new Date().toISOString(),
      })
      .eq('id', periodId);

    // Create audit log
    await serviceClient
      .from('admin_audit')
      .insert({
        admin_id: user.id,
        action: 'close_period',
        entity_type: 'reward_periods',
        entity_id: periodId,
        new_values: { winners: winners.length, distribution },
      });

    return NextResponse.json({
      success: true,
      winnersCount: winners.length,
      winners: winners.map(w => ({
        rank: w.rank,
        points: w.total_points,
        prize: w.prize_amount_mxn,
      })),
    });
  } catch (error) {
    console.error('Close period error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
