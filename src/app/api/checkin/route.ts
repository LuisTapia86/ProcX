import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

// Streak bonus configuration
const STREAK_BONUSES: Record<number, number> = {
  3: 10,
  5: 20,
  10: 50,
  15: 80,
  21: 120,
  30: 200,
};

// Rate limiting: max 10 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const serviceClient = createServiceRoleClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting check
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

    const { data: rateLimit } = await serviceClient
      .from('rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('endpoint', 'checkin')
      .single();

    if (rateLimit) {
      const lastRequest = new Date(rateLimit.window_start);
      if (lastRequest > windowStart) {
        if (rateLimit.request_count >= RATE_LIMIT_MAX) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }
        // Update count
        await serviceClient
          .from('rate_limits')
          .update({ request_count: rateLimit.request_count + 1 })
          .eq('id', rateLimit.id);
      } else {
        // Reset window
        await serviceClient
          .from('rate_limits')
          .update({ request_count: 1, window_start: now.toISOString() })
          .eq('id', rateLimit.id);
      }
    } else {
      // Create rate limit record
      await serviceClient
        .from('rate_limits')
        .insert({ user_id: user.id, endpoint: 'checkin', request_count: 1 });
    }

    // Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
    }

    // Get request body
    const { userChallengeId } = await request.json();

    if (!userChallengeId) {
      return NextResponse.json({ error: 'userChallengeId is required' }, { status: 400 });
    }

    // Get user challenge
    const { data: userChallenge } = await supabase
      .from('user_challenges')
      .select('*, challenge_catalog(*)')
      .eq('id', userChallengeId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!userChallenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCheckin } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_challenge_id', userChallengeId)
      .eq('checkin_date', today)
      .single();

    if (existingCheckin) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }

    // Get current period
    const { data: currentPeriod } = await supabase
      .from('reward_periods')
      .select('id')
      .eq('status', 'active')
      .single();

    // Calculate points
    const challenge = userChallenge.challenge_catalog as { points_per_checkin: number };
    const basePoints = challenge.points_per_checkin;
    const newStreak = userChallenge.current_streak + 1;
    const streakBonus = STREAK_BONUSES[newStreak] || 0;
    const totalPoints = basePoints + streakBonus;

    // Create check-in
    const { error: checkinError } = await serviceClient
      .from('checkins')
      .insert({
        user_id: user.id,
        user_challenge_id: userChallengeId,
        checkin_date: today,
        points_earned: totalPoints,
      });

    if (checkinError) {
      console.error('Checkin error:', checkinError);
      return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 });
    }

    // Update user challenge
    await serviceClient
      .from('user_challenges')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, userChallenge.longest_streak),
        total_checkins: userChallenge.total_checkins + 1,
        last_checkin_date: today,
        consecutive_misses: 0,
      })
      .eq('id', userChallengeId);

    // Record base points event
    if (currentPeriod) {
      await serviceClient
        .from('point_events')
        .insert({
          user_id: user.id,
          user_challenge_id: userChallengeId,
          event_type: 'checkin',
          points: basePoints,
          description: `Check-in for challenge`,
          period_id: currentPeriod.id,
        });

      // Record streak bonus if applicable
      if (streakBonus > 0) {
        await serviceClient
          .from('point_events')
          .insert({
            user_id: user.id,
            user_challenge_id: userChallengeId,
            event_type: 'streak_bonus',
            points: streakBonus,
            description: `Day ${newStreak} streak bonus`,
            period_id: currentPeriod.id,
          });
      }
    }

    return NextResponse.json({
      success: true,
      points: totalPoints,
      streak: newStreak,
      streakBonus,
    });
  } catch (error) {
    console.error('Checkin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
