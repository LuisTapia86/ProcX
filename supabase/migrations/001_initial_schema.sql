-- ==============================================
-- PROCX DATABASE SCHEMA
-- ==============================================
-- This migration creates all tables for the ProcX anti-procrastination app
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- PROFILES TABLE
-- ==============================================
-- Stores user profile information linked to Supabase Auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster role lookups
CREATE INDEX idx_profiles_role ON profiles(role);

-- ==============================================
-- SUBSCRIPTIONS TABLE
-- ==============================================
-- Tracks user subscriptions from Stripe
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE UNIQUE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- ==============================================
-- CHALLENGE CATALOG TABLE
-- ==============================================
-- Admin-created challenges that users can join
CREATE TABLE challenge_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_es TEXT,
    description_en TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('very_easy', 'easy', 'medium', 'hard', 'very_hard', 'extreme')),
    points_per_checkin INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set points based on difficulty
CREATE OR REPLACE FUNCTION set_challenge_points()
RETURNS TRIGGER AS $$
BEGIN
    NEW.points_per_checkin := CASE NEW.difficulty
        WHEN 'very_easy' THEN 5
        WHEN 'easy' THEN 8
        WHEN 'medium' THEN 12
        WHEN 'hard' THEN 18
        WHEN 'very_hard' THEN 25
        WHEN 'extreme' THEN 35
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_challenge_points
    BEFORE INSERT OR UPDATE OF difficulty ON challenge_catalog
    FOR EACH ROW
    EXECUTE FUNCTION set_challenge_points();

-- ==============================================
-- USER CHALLENGES TABLE
-- ==============================================
-- Tracks which challenges each user has joined
CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenge_catalog(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_checkins INTEGER NOT NULL DEFAULT 0,
    last_checkin_date DATE,
    consecutive_misses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, challenge_id, status) -- Prevent duplicate active challenges
);

-- Indexes
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);

-- ==============================================
-- CHECKINS TABLE
-- ==============================================
-- Records each daily check-in
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_challenge_id, checkin_date) -- One check-in per challenge per day
);

-- Indexes
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(checkin_date);

-- ==============================================
-- POINT EVENTS TABLE
-- ==============================================
-- Tracks all point changes for audit purposes
CREATE TABLE point_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('checkin', 'streak_bonus', 'adjustment', 'period_reset')),
    points INTEGER NOT NULL,
    description TEXT,
    period_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_point_events_user_id ON point_events(user_id);
CREATE INDEX idx_point_events_period_id ON point_events(period_id);
CREATE INDEX idx_point_events_created_at ON point_events(created_at);

-- ==============================================
-- REWARD PERIODS TABLE
-- ==============================================
-- Monthly reward periods
CREATE TABLE reward_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'paid')),
    total_revenue_mxn DECIMAL(12, 2) NOT NULL DEFAULT 0,
    creator_fee_mxn DECIMAL(12, 2) NOT NULL DEFAULT 0,
    reward_pool_mxn DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_subscribers INTEGER NOT NULL DEFAULT 0,
    winner_count INTEGER,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(start_date, end_date)
);

-- ==============================================
-- WINNERS TABLE
-- ==============================================
-- Stores winner information for each period
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL REFERENCES reward_periods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    prize_percentage DECIMAL(5, 2) NOT NULL,
    prize_amount_mxn DECIMAL(12, 2) NOT NULL,
    tie_break_used BOOLEAN NOT NULL DEFAULT false,
    tie_break_seed TEXT,
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_id, rank)
);

-- Indexes
CREATE INDEX idx_winners_period_id ON winners(period_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);

-- ==============================================
-- KYC SUBMISSIONS TABLE
-- ==============================================
-- Stores KYC information for winners
CREATE TABLE kyc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    clabe TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_document_path TEXT, -- Path in Supabase Storage
    selfie_path TEXT, -- Path in Supabase Storage
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_kyc_submissions_user_id ON kyc_submissions(user_id);

-- ==============================================
-- PAYOUT REQUESTS TABLE
-- ==============================================
-- Tracks payout requests from winners
CREATE TABLE payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    winner_id UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    kyc_submission_id UUID REFERENCES kyc_submissions(id),
    amount_mxn DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'kyc_required', 'processing', 'paid', 'failed')),
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);

-- ==============================================
-- ADMIN AUDIT TABLE
-- ==============================================
-- Logs all admin actions for accountability
CREATE TABLE admin_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_admin_audit_admin_id ON admin_audit(admin_id);
CREATE INDEX idx_admin_audit_created_at ON admin_audit(created_at);

-- ==============================================
-- RATE LIMITING TABLE
-- ==============================================
-- For basic rate limiting on check-in endpoints
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_challenge_catalog_updated_at
    BEFORE UPDATE ON challenge_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_challenges_updated_at
    BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_reward_periods_updated_at
    BEFORE UPDATE ON reward_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_kyc_submissions_updated_at
    BEFORE UPDATE ON kyc_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_payout_requests_updated_at
    BEFORE UPDATE ON payout_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get user's monthly points
CREATE OR REPLACE FUNCTION get_user_monthly_points(p_user_id UUID, p_period_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO v_total
    FROM point_events
    WHERE user_id = p_user_id
    AND period_id = p_period_id;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM subscriptions
        WHERE user_id = p_user_id
        AND status = 'active'
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count user's active challenges
CREATE OR REPLACE FUNCTION count_active_challenges(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) FROM user_challenges
        WHERE user_id = p_user_id
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
