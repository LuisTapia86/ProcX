-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================
-- This migration enables RLS and creates policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- HELPER FUNCTION: Check if user is admin
-- ==============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PROFILES POLICIES
-- ==============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (role = (SELECT role FROM profiles WHERE id = auth.uid())) -- Cannot change own role
    );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

-- ==============================================
-- SUBSCRIPTIONS POLICIES
-- ==============================================
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhooks)
-- No policy needed as service role bypasses RLS

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (is_admin());

-- ==============================================
-- CHALLENGE CATALOG POLICIES
-- ==============================================
-- Everyone can view active challenges
CREATE POLICY "Anyone can view active challenges"
    ON challenge_catalog FOR SELECT
    USING (is_active = true);

-- Admins can view all challenges
CREATE POLICY "Admins can view all challenges"
    ON challenge_catalog FOR SELECT
    USING (is_admin());

-- Admins can insert challenges
CREATE POLICY "Admins can insert challenges"
    ON challenge_catalog FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update challenges
CREATE POLICY "Admins can update challenges"
    ON challenge_catalog FOR UPDATE
    USING (is_admin());

-- Admins can delete challenges
CREATE POLICY "Admins can delete challenges"
    ON challenge_catalog FOR DELETE
    USING (is_admin());

-- ==============================================
-- USER CHALLENGES POLICIES
-- ==============================================
-- Users can view their own challenges
CREATE POLICY "Users can view own challenges"
    ON user_challenges FOR SELECT
    USING (auth.uid() = user_id);

-- Users can join challenges (insert)
CREATE POLICY "Users can join challenges"
    ON user_challenges FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND has_active_subscription(auth.uid())
        AND count_active_challenges(auth.uid()) < 3
    );

-- Users can update their own challenges (abandon)
CREATE POLICY "Users can update own challenges"
    ON user_challenges FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all user challenges
CREATE POLICY "Admins can view all user challenges"
    ON user_challenges FOR SELECT
    USING (is_admin());

-- ==============================================
-- CHECKINS POLICIES
-- ==============================================
-- Users can view their own check-ins
CREATE POLICY "Users can view own checkins"
    ON checkins FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert check-ins for their own challenges
CREATE POLICY "Users can insert checkins"
    ON checkins FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND has_active_subscription(auth.uid())
    );

-- Admins can view all check-ins
CREATE POLICY "Admins can view all checkins"
    ON checkins FOR SELECT
    USING (is_admin());

-- ==============================================
-- POINT EVENTS POLICIES
-- ==============================================
-- Users can view their own point events
CREATE POLICY "Users can view own point events"
    ON point_events FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all point events
CREATE POLICY "Admins can view all point events"
    ON point_events FOR SELECT
    USING (is_admin());

-- Admins can insert point events
CREATE POLICY "Admins can insert point events"
    ON point_events FOR INSERT
    WITH CHECK (is_admin());

-- ==============================================
-- REWARD PERIODS POLICIES
-- ==============================================
-- Everyone can view reward periods
CREATE POLICY "Anyone can view reward periods"
    ON reward_periods FOR SELECT
    USING (true);

-- Admins can manage reward periods
CREATE POLICY "Admins can insert reward periods"
    ON reward_periods FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update reward periods"
    ON reward_periods FOR UPDATE
    USING (is_admin());

-- ==============================================
-- WINNERS POLICIES
-- ==============================================
-- Users can view winners (public leaderboard)
CREATE POLICY "Anyone can view winners"
    ON winners FOR SELECT
    USING (true);

-- Admins can manage winners
CREATE POLICY "Admins can insert winners"
    ON winners FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update winners"
    ON winners FOR UPDATE
    USING (is_admin());

-- ==============================================
-- KYC SUBMISSIONS POLICIES
-- ==============================================
-- Users can view their own KYC submissions
CREATE POLICY "Users can view own kyc"
    ON kyc_submissions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own KYC submissions
CREATE POLICY "Users can insert own kyc"
    ON kyc_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending KYC submissions
CREATE POLICY "Users can update own pending kyc"
    ON kyc_submissions FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all KYC submissions
CREATE POLICY "Admins can view all kyc"
    ON kyc_submissions FOR SELECT
    USING (is_admin());

-- Admins can update KYC submissions (approve/reject)
CREATE POLICY "Admins can update kyc"
    ON kyc_submissions FOR UPDATE
    USING (is_admin());

-- ==============================================
-- PAYOUT REQUESTS POLICIES
-- ==============================================
-- Users can view their own payout requests
CREATE POLICY "Users can view own payouts"
    ON payout_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all payout requests
CREATE POLICY "Admins can view all payouts"
    ON payout_requests FOR SELECT
    USING (is_admin());

-- Admins can manage payout requests
CREATE POLICY "Admins can insert payouts"
    ON payout_requests FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update payouts"
    ON payout_requests FOR UPDATE
    USING (is_admin());

-- ==============================================
-- ADMIN AUDIT POLICIES
-- ==============================================
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON admin_audit FOR SELECT
    USING (is_admin());

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
    ON admin_audit FOR INSERT
    WITH CHECK (is_admin());

-- ==============================================
-- RATE LIMITS POLICIES
-- ==============================================
-- Users can view their own rate limits
CREATE POLICY "Users can view own rate limits"
    ON rate_limits FOR SELECT
    USING (auth.uid() = user_id);

-- System manages rate limits via service role
-- No additional policies needed

-- ==============================================
-- STORAGE POLICIES (for KYC documents)
-- ==============================================
-- Note: Run these in Supabase Dashboard > Storage > Policies

-- Create storage bucket for KYC documents (run in SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies should be created in Supabase Dashboard:
-- 1. Users can upload to their own folder: kyc-documents/{user_id}/*
-- 2. Users can view their own files
-- 3. Admins can view all files
