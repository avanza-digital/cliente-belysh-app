// Tipos generados desde el esquema real de Supabase (proyecto BELYSH).
// Regenerar tras cambios de esquema: MCP generate_typescript_types o `supabase gen types`.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addons: {
        Row: {
          active: boolean
          id: string
          label: string
          price: number
        }
        Insert: {
          active?: boolean
          id: string
          label: string
          price: number
        }
        Update: {
          active?: boolean
          id?: string
          label?: string
          price?: number
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appt_date: string | null
          appt_time: string | null
          created_at: string
          duration_min: number | null
          id: string
          price: number
          service_id: string | null
          service_name: string
          starts_at: string | null
          status: string
          stylist_id: string | null
          stylist_name: string | null
          user_id: string
        }
        Insert: {
          appt_date?: string | null
          appt_time?: string | null
          created_at?: string
          duration_min?: number | null
          id?: string
          price?: number
          service_id?: string | null
          service_name: string
          starts_at?: string | null
          status?: string
          stylist_id?: string | null
          stylist_name?: string | null
          user_id: string
        }
        Update: {
          appt_date?: string | null
          appt_time?: string | null
          created_at?: string
          duration_min?: number | null
          id?: string
          price?: number
          service_id?: string | null
          service_name?: string
          starts_at?: string | null
          status?: string
          stylist_id?: string | null
          stylist_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bonus_rules: {
        Row: {
          active: boolean
          config: Json
          ends_at: string | null
          id: string
          multiplier: number
          name: string
          points_delta: number
          starts_at: string | null
          type: string
        }
        Insert: {
          active?: boolean
          config?: Json
          ends_at?: string | null
          id?: string
          multiplier?: number
          name: string
          points_delta?: number
          starts_at?: string | null
          type: string
        }
        Update: {
          active?: boolean
          config?: Json
          ends_at?: string | null
          id?: string
          multiplier?: number
          name?: string
          points_delta?: number
          starts_at?: string | null
          type?: string
        }
        Relationships: []
      }
      payment_line_items: {
        Row: {
          amount: number
          id: string
          kind: string
          label: string
          payment_id: string
          qty: number
          service_id: string | null
          unit_price: number
        }
        Insert: {
          amount?: number
          id?: string
          kind: string
          label: string
          payment_id: string
          qty?: number
          service_id?: string | null
          unit_price?: number
        }
        Update: {
          amount?: number
          id?: string
          kind?: string
          label?: string
          payment_id?: string
          qty?: number
          service_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_line_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_line_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          appointment_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          method: string
          operation_number: string | null
          status: string
          subtotal: number
          tier_discount_amount: number
          tier_discount_pct: number
          total: number
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          method: string
          operation_number?: string | null
          status?: string
          subtotal?: number
          tier_discount_amount?: number
          tier_discount_pct?: number
          total?: number
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          method?: string
          operation_number?: string | null
          status?: string
          subtotal?: number
          tier_discount_amount?: number
          tier_discount_pct?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          note: string | null
          points: number
          ref_id: string | null
          ref_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          points: number
          ref_id?: string | null
          ref_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          points?: number
          ref_id?: string | null
          ref_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthdate: string | null
          club_points: number
          created_at: string
          full_name: string | null
          id: string
          member_since: string
          phone: string | null
          role: string
        }
        Insert: {
          birthdate?: string | null
          club_points?: number
          created_at?: string
          full_name?: string | null
          id: string
          member_since?: string
          phone?: string | null
          role?: string
        }
        Update: {
          birthdate?: string | null
          club_points?: number
          created_at?: string
          full_name?: string | null
          id?: string
          member_since?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          cost: number
          id: string
          title: string
        }
        Insert: {
          cost: number
          id: string
          title: string
        }
        Update: {
          cost?: number
          id?: string
          title?: string
        }
        Relationships: []
      }
      schedule_slots: {
        Row: {
          slot: string
        }
        Insert: {
          slot: string
        }
        Update: {
          slot?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string | null
          duration_min: number | null
          id: string
          name: string
          price: number
        }
        Insert: {
          category?: string | null
          duration_min?: number | null
          id: string
          name: string
          price: number
        }
        Update: {
          category?: string | null
          duration_min?: number | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      tiers: {
        Row: {
          discount_pct: number
          min_soles: number
          name: string
          sort: number
        }
        Insert: {
          discount_pct?: number
          min_soles: number
          name: string
          sort: number
        }
        Update: {
          discount_pct?: number
          min_soles?: number
          name?: string
          sort?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_discount_pct: { Args: { p_user: string }; Returns: number }
      client_spend_12m: { Args: { p_user: string }; Returns: number }
      client_tier: { Args: { p_user: string }; Returns: string }
      confirm_payment: {
        Args: {
          p_appointment_id: string
          p_line_items: Json
          p_method: string
          p_operation_number: string
        }
        Returns: Json
      }
      full_days: {
        Args: { p_from: string; p_stylist: string; p_to: string }
        Returns: string[]
      }
      is_staff: { Args: never; Returns: boolean }
      redeem_reward: { Args: { p_reward_id: string }; Returns: number }
      reschedule_appointment: {
        Args: {
          p_appointment_id: string
          p_starts_at: string
          p_stylist_id: string
          p_stylist_name: string
        }
        Returns: {
          appt_date: string | null
          appt_time: string | null
          created_at: string
          duration_min: number | null
          id: string
          price: number
          service_id: string | null
          service_name: string
          starts_at: string | null
          status: string
          stylist_id: string | null
          stylist_name: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "appointments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      slots_per_day: { Args: never; Returns: number }
      taken_times: {
        Args: { p_appt_date: string; p_stylist: string }
        Returns: string[]
      }
      void_payment: { Args: { p_payment_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Atajos cómodos para la capa api/UI
type Public = Database['public']
export type Appointment = Public['Tables']['appointments']['Row']
export type Profile = Public['Tables']['profiles']['Row']
export type PointTransaction = Public['Tables']['point_transactions']['Row']
export type Reward = Public['Tables']['rewards']['Row']
export type Service = Public['Tables']['services']['Row']
export type Payment = Public['Tables']['payments']['Row']
export type PaymentLineItem = Public['Tables']['payment_line_items']['Row']
export type Addon = Public['Tables']['addons']['Row']
export type TierRow = Public['Tables']['tiers']['Row']

