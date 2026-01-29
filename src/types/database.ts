export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'user' | 'admin';
          language: 'es' | 'en';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'user' | 'admin';
          language?: 'es' | 'en';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'user' | 'admin';
          language?: 'es' | 'en';
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          status: 'active' | 'inactive' | 'canceled' | 'past_due';
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          status?: 'active' | 'inactive' | 'canceled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string | null;
          status?: 'active' | 'inactive' | 'canceled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenge_catalog: {
        Row: {
          id: string;
          name_es: string;
          name_en: string;
          description_es: string | null;
          description_en: string | null;
          difficulty: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'extreme';
          points_per_checkin: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_es: string;
          name_en: string;
          description_es?: string | null;
          description_en?: string | null;
          difficulty: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'extreme';
          points_per_checkin?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_es?: string;
          name_en?: string;
          description_es?: string | null;
          description_en?: string | null;
          difficulty?: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'extreme';
          points_per_checkin?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          status: 'active' | 'completed' | 'failed' | 'abandoned';
          started_at: string;
          ended_at: string | null;
          current_streak: number;
          longest_streak: number;
          total_checkins: number;
          last_checkin_date: string | null;
          consecutive_misses: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          status?: 'active' | 'completed' | 'failed' | 'abandoned';
          started_at?: string;
          ended_at?: string | null;
          current_streak?: number;
          longest_streak?: number;
          total_checkins?: number;
          last_checkin_date?: string | null;
          consecutive_misses?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          status?: 'active' | 'completed' | 'failed' | 'abandoned';
          started_at?: string;
          ended_at?: string | null;
          current_streak?: number;
          longest_streak?: number;
          total_checkins?: number;
          last_checkin_date?: string | null;
          consecutive_misses?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          user_challenge_id: string;
          checkin_date: string;
          checkin_time: string;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_challenge_id: string;
          checkin_date?: string;
          checkin_time?: string;
          points_earned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_challenge_id?: string;
          checkin_date?: string;
          checkin_time?: string;
          points_earned?: number;
          created_at?: string;
        };
      };
      point_events: {
        Row: {
          id: string;
          user_id: string;
          user_challenge_id: string | null;
          event_type: 'checkin' | 'streak_bonus' | 'adjustment' | 'period_reset';
          points: number;
          description: string | null;
          period_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_challenge_id?: string | null;
          event_type: 'checkin' | 'streak_bonus' | 'adjustment' | 'period_reset';
          points: number;
          description?: string | null;
          period_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_challenge_id?: string | null;
          event_type?: 'checkin' | 'streak_bonus' | 'adjustment' | 'period_reset';
          points?: number;
          description?: string | null;
          period_id?: string | null;
          created_at?: string;
        };
      };
      reward_periods: {
        Row: {
          id: string;
          period_name: string;
          start_date: string;
          end_date: string;
          status: 'active' | 'closed' | 'paid';
          total_revenue_mxn: number;
          creator_fee_mxn: number;
          reward_pool_mxn: number;
          total_subscribers: number;
          winner_count: number | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_name: string;
          start_date: string;
          end_date: string;
          status?: 'active' | 'closed' | 'paid';
          total_revenue_mxn?: number;
          creator_fee_mxn?: number;
          reward_pool_mxn?: number;
          total_subscribers?: number;
          winner_count?: number | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period_name?: string;
          start_date?: string;
          end_date?: string;
          status?: 'active' | 'closed' | 'paid';
          total_revenue_mxn?: number;
          creator_fee_mxn?: number;
          reward_pool_mxn?: number;
          total_subscribers?: number;
          winner_count?: number | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      winners: {
        Row: {
          id: string;
          period_id: string;
          user_id: string;
          rank: number;
          total_points: number;
          prize_percentage: number;
          prize_amount_mxn: number;
          tie_break_used: boolean;
          tie_break_seed: string | null;
          payout_status: 'pending' | 'processing' | 'paid' | 'failed';
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          period_id: string;
          user_id: string;
          rank: number;
          total_points: number;
          prize_percentage: number;
          prize_amount_mxn: number;
          tie_break_used?: boolean;
          tie_break_seed?: string | null;
          payout_status?: 'pending' | 'processing' | 'paid' | 'failed';
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          period_id?: string;
          user_id?: string;
          rank?: number;
          total_points?: number;
          prize_percentage?: number;
          prize_amount_mxn?: number;
          tie_break_used?: boolean;
          tie_break_seed?: string | null;
          payout_status?: 'pending' | 'processing' | 'paid' | 'failed';
          paid_at?: string | null;
          created_at?: string;
        };
      };
      kyc_submissions: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          clabe: string;
          bank_name: string;
          email: string;
          phone: string;
          id_document_path: string | null;
          selfie_path: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          clabe: string;
          bank_name: string;
          email: string;
          phone: string;
          id_document_path?: string | null;
          selfie_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          clabe?: string;
          bank_name?: string;
          email?: string;
          phone?: string;
          id_document_path?: string | null;
          selfie_path?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payout_requests: {
        Row: {
          id: string;
          winner_id: string;
          user_id: string;
          kyc_submission_id: string | null;
          amount_mxn: number;
          status: 'pending' | 'kyc_required' | 'processing' | 'paid' | 'failed';
          processed_by: string | null;
          processed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          winner_id: string;
          user_id: string;
          kyc_submission_id?: string | null;
          amount_mxn: number;
          status?: 'pending' | 'kyc_required' | 'processing' | 'paid' | 'failed';
          processed_by?: string | null;
          processed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          winner_id?: string;
          user_id?: string;
          kyc_submission_id?: string | null;
          amount_mxn?: number;
          status?: 'pending' | 'kyc_required' | 'processing' | 'paid' | 'failed';
          processed_by?: string | null;
          processed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_audit: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          request_count: number;
          window_start: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          request_count?: number;
          window_start?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          request_count?: number;
          window_start?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_active_subscription: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      count_active_challenges: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_monthly_points: {
        Args: { p_user_id: string; p_period_id: string };
        Returns: number;
      };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
