export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      game_saves: {
        Row: {
          created_at: string
          game_date: string
          id: string
          is_active: boolean
          last_match_id: string | null
          next_action: string | null
          pending_tasks: Json | null
          save_name: string
          season_year: number
          team_id: string
          team_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_date?: string
          id?: string
          is_active?: boolean
          last_match_id?: string | null
          next_action?: string | null
          pending_tasks?: Json | null
          save_name: string
          season_year?: number
          team_id: string
          team_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
          is_active?: boolean
          last_match_id?: string | null
          next_action?: string | null
          pending_tasks?: Json | null
          save_name?: string
          season_year?: number
          team_id?: string
          team_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leagues: {
        Row: {
          confederation: string
          country: string
          created_at: string
          founded: number
          id: string
          name: string
          reputation: number
          tier: number
        }
        Insert: {
          confederation: string
          country: string
          created_at?: string
          founded: number
          id: string
          name: string
          reputation: number
          tier: number
        }
        Update: {
          confederation?: string
          country?: string
          created_at?: string
          founded?: number
          id?: string
          name?: string
          reputation?: number
          tier?: number
        }
        Relationships: []
      }
      manager_performance: {
        Row: {
          achievements: Json | null
          created_at: string
          draws: number
          id: string
          losses: number
          matches_managed: number
          overall_rating: number
          save_id: string
          tenure_days: number
          trophies_won: number
          updated_at: string
          wins: number
        }
        Insert: {
          achievements?: Json | null
          created_at?: string
          draws?: number
          id?: string
          losses?: number
          matches_managed?: number
          overall_rating?: number
          save_id: string
          tenure_days?: number
          trophies_won?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          achievements?: Json | null
          created_at?: string
          draws?: number
          id?: string
          losses?: number
          matches_managed?: number
          overall_rating?: number
          save_id?: string
          tenure_days?: number
          trophies_won?: number
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "manager_performance_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: true
            referencedRelation: "game_saves"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          contract_expiry: string
          created_at: string
          date_of_birth: string
          defending: number
          height: number
          id: string
          market_value: number
          mental: number
          name: string
          nationality: string
          overall: number
          pace: number
          passing: number
          physical: number
          position: string
          potential: number
          preferred_foot: string | null
          shooting: number
          team_id: string
          technical: number
          updated_at: string
          wage: number
          weight: number
        }
        Insert: {
          age: number
          contract_expiry: string
          created_at?: string
          date_of_birth: string
          defending: number
          height: number
          id: string
          market_value: number
          mental: number
          name: string
          nationality: string
          overall: number
          pace: number
          passing: number
          physical: number
          position: string
          potential: number
          preferred_foot?: string | null
          shooting: number
          team_id: string
          technical: number
          updated_at?: string
          wage: number
          weight: number
        }
        Update: {
          age?: number
          contract_expiry?: string
          created_at?: string
          date_of_birth?: string
          defending?: number
          height?: number
          id?: string
          market_value?: number
          mental?: number
          name?: string
          nationality?: string
          overall?: number
          pace?: number
          passing?: number
          physical?: number
          position?: string
          potential?: number
          preferred_foot?: string | null
          shooting?: number
          team_id?: string
          technical?: number
          updated_at?: string
          wage?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_data_collection: boolean | null
          animations_enabled: boolean | null
          auto_save_frequency: string | null
          avatar_url: string | null
          color_blind_mode: string | null
          commentary_volume: number | null
          created_at: string
          default_dashboard_view: string | null
          email_notifications: boolean | null
          font_size: string | null
          high_contrast_mode: boolean | null
          id: string
          in_game_alerts: boolean | null
          manager_name: string
          master_volume: number | null
          match_speed_default: string | null
          music_volume: number | null
          mute_all: boolean | null
          notification_sound: boolean | null
          preferred_language: string | null
          profile_visibility: string | null
          reduce_motion: boolean | null
          sfx_volume: number | null
          sidebar_default_collapsed: boolean | null
          theme_mode: string | null
          tutorial_hints_enabled: boolean | null
          ui_compact_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_data_collection?: boolean | null
          animations_enabled?: boolean | null
          auto_save_frequency?: string | null
          avatar_url?: string | null
          color_blind_mode?: string | null
          commentary_volume?: number | null
          created_at?: string
          default_dashboard_view?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          high_contrast_mode?: boolean | null
          id?: string
          in_game_alerts?: boolean | null
          manager_name: string
          master_volume?: number | null
          match_speed_default?: string | null
          music_volume?: number | null
          mute_all?: boolean | null
          notification_sound?: boolean | null
          preferred_language?: string | null
          profile_visibility?: string | null
          reduce_motion?: boolean | null
          sfx_volume?: number | null
          sidebar_default_collapsed?: boolean | null
          theme_mode?: string | null
          tutorial_hints_enabled?: boolean | null
          ui_compact_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_data_collection?: boolean | null
          animations_enabled?: boolean | null
          auto_save_frequency?: string | null
          avatar_url?: string | null
          color_blind_mode?: string | null
          commentary_volume?: number | null
          created_at?: string
          default_dashboard_view?: string | null
          email_notifications?: boolean | null
          font_size?: string | null
          high_contrast_mode?: boolean | null
          id?: string
          in_game_alerts?: boolean | null
          manager_name?: string
          master_volume?: number | null
          match_speed_default?: string | null
          music_volume?: number | null
          mute_all?: boolean | null
          notification_sound?: boolean | null
          preferred_language?: string | null
          profile_visibility?: string | null
          reduce_motion?: boolean | null
          sfx_volume?: number | null
          sidebar_default_collapsed?: boolean | null
          theme_mode?: string | null
          tutorial_hints_enabled?: boolean | null
          ui_compact_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      save_finances: {
        Row: {
          balance: number
          created_at: string
          id: string
          save_id: string
          total_expenses: number
          total_revenue: number
          transfer_budget: number
          updated_at: string
          wage_budget: number
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          save_id: string
          total_expenses?: number
          total_revenue?: number
          transfer_budget?: number
          updated_at?: string
          wage_budget?: number
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          save_id?: string
          total_expenses?: number
          total_revenue?: number
          transfer_budget?: number
          updated_at?: string
          wage_budget?: number
        }
        Relationships: [
          {
            foreignKeyName: "save_finances_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: true
            referencedRelation: "game_saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_matches: {
        Row: {
          away_score: number | null
          away_team_id: string
          away_team_name: string
          competition: string
          created_at: string
          home_score: number | null
          home_team_id: string
          home_team_name: string
          id: string
          match_data: Json | null
          match_date: string
          season_id: string
          status: string
          tactical_setup: Json | null
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          away_team_name: string
          competition: string
          created_at?: string
          home_score?: number | null
          home_team_id: string
          home_team_name: string
          id?: string
          match_data?: Json | null
          match_date: string
          season_id: string
          status?: string
          tactical_setup?: Json | null
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          away_team_name?: string
          competition?: string
          created_at?: string
          home_score?: number | null
          home_team_id?: string
          home_team_name?: string
          id?: string
          match_data?: Json | null
          match_date?: string
          season_id?: string
          status?: string
          tactical_setup?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "save_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      save_players: {
        Row: {
          appearances: number
          assists: number
          average_rating: number | null
          created_at: string
          fitness: number
          form: number
          goals: number
          id: string
          morale: number
          player_id: string
          red_cards: number
          save_id: string
          team_id: string
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          appearances?: number
          assists?: number
          average_rating?: number | null
          created_at?: string
          fitness?: number
          form?: number
          goals?: number
          id?: string
          morale?: number
          player_id: string
          red_cards?: number
          save_id: string
          team_id: string
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          appearances?: number
          assists?: number
          average_rating?: number | null
          created_at?: string
          fitness?: number
          form?: number
          goals?: number
          id?: string
          morale?: number
          player_id?: string
          red_cards?: number
          save_id?: string
          team_id?: string
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_save_players_player_id"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "save_players_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: false
            referencedRelation: "game_saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_seasons: {
        Row: {
          created_at: string
          current_game_week: number
          current_matchday: number
          fixtures_state: Json | null
          id: string
          is_current: boolean
          save_id: string
          season_current_date: string | null
          season_year: number
          standings_state: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_game_week?: number
          current_matchday?: number
          fixtures_state?: Json | null
          id?: string
          is_current?: boolean
          save_id: string
          season_current_date?: string | null
          season_year: number
          standings_state?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_game_week?: number
          current_matchday?: number
          fixtures_state?: Json | null
          id?: string
          is_current?: boolean
          save_id?: string
          season_current_date?: string | null
          season_year?: number
          standings_state?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "save_seasons_save_id_fkey"
            columns: ["save_id"]
            isOneToOne: false
            referencedRelation: "game_saves"
            referencedColumns: ["id"]
          },
        ]
      }
      save_standings: {
        Row: {
          created_at: string
          drawn: number
          form: Json | null
          goal_difference: number
          goals_against: number
          goals_for: number
          id: string
          league_id: string
          lost: number
          played: number
          points: number
          position: number
          season_id: string
          team_id: string
          team_name: string
          updated_at: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          form?: Json | null
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          id?: string
          league_id: string
          lost?: number
          played?: number
          points?: number
          position: number
          season_id: string
          team_id: string
          team_name: string
          updated_at?: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          form?: Json | null
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          id?: string
          league_id?: string
          lost?: number
          played?: number
          points?: number
          position?: number
          season_id?: string
          team_id?: string
          team_name?: string
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "save_standings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "save_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          balance: number
          capacity: number
          country: string
          created_at: string
          founded: number | null
          id: string
          league_id: string
          name: string
          primary_color: string
          reputation: number
          secondary_color: string
          short_name: string | null
          stadium: string
        }
        Insert: {
          balance?: number
          capacity: number
          country: string
          created_at?: string
          founded?: number | null
          id: string
          league_id: string
          name: string
          primary_color: string
          reputation: number
          secondary_color: string
          short_name?: string | null
          stadium: string
        }
        Update: {
          balance?: number
          capacity?: number
          country?: string
          created_at?: string
          founded?: number | null
          id?: string
          league_id?: string
          name?: string
          primary_color?: string
          reputation?: number
          secondary_color?: string
          short_name?: string | null
          stadium?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
