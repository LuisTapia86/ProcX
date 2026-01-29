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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'user_challenges_challenge_id_fkey';
            columns: ['challenge_id'];
            isOneToOne: false;
            referencedRelation: 'challenge_catalog';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_challenges_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'winners_period_id_fkey';
            columns: ['period_id'];
            isOneToOne: false;
            referencedRelation: 'reward_periods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'winners_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
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
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
