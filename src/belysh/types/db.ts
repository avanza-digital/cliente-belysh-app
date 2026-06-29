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
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
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
          status?: string
          stylist_id?: string | null
          stylist_name?: string | null
          user_id?: string
        }
        Relationships: []
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
          club_points: number
          created_at: string
          full_name: string | null
          id: string
          member_since: string
          phone: string | null
          role: string
        }
        Insert: {
          club_points?: number
          created_at?: string
          full_name?: string | null
          id: string
          member_since?: string
          phone?: string | null
          role?: string
        }
        Update: {
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
        Row: { cost: number; id: string; title: string }
        Insert: { cost: number; id: string; title: string }
        Update: { cost?: number; id?: string; title?: string }
        Relationships: []
      }
      services: {
        Row: { duration_min: number | null; id: string; name: string; price: number }
        Insert: { duration_min?: number | null; id: string; name: string; price: number }
        Update: { duration_min?: number | null; id?: string; name?: string; price?: number }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      redeem_reward: { Args: { p_reward_id: string }; Returns: number }
      taken_times: { Args: { p_appt_date: string; p_stylist: string }; Returns: string[] }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Atajos cómodos para la capa api/UI
type Public = Database['public']
export type Appointment = Public['Tables']['appointments']['Row']
export type Profile = Public['Tables']['profiles']['Row']
export type PointTransaction = Public['Tables']['point_transactions']['Row']
export type Reward = Public['Tables']['rewards']['Row']
export type Service = Public['Tables']['services']['Row']
