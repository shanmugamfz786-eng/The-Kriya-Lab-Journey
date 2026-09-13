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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      content_blocks: {
        Row: {
          block_key: string
          created_at: string
          id: string
          label: string | null
          page: string
          sort_order: number
          text_en: string
          text_ta: string
          updated_at: string
        }
        Insert: {
          block_key: string
          created_at?: string
          id?: string
          label?: string | null
          page: string
          sort_order?: number
          text_en?: string
          text_ta?: string
          updated_at?: string
        }
        Update: {
          block_key?: string
          created_at?: string
          id?: string
          label?: string | null
          page?: string
          sort_order?: number
          text_en?: string
          text_ta?: string
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          id: string
          kind: string
          language: string
          message: string | null
          name: string
          phone: string | null
          program_date_id: string | null
          programme: string | null
          session_date: string | null
          source_page: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          language?: string
          message?: string | null
          name: string
          phone?: string | null
          program_date_id?: string | null
          programme?: string | null
          session_date?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          language?: string
          message?: string | null
          name?: string
          phone?: string | null
          program_date_id?: string | null
          programme?: string | null
          session_date?: string | null
          source_page?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_program_date_id_fkey"
            columns: ["program_date_id"]
            isOneToOne: false
            referencedRelation: "program_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description_en: string
          description_ta: string
          end_time: string
          event_date: string
          id: string
          is_published: boolean
          sort_order: number
          start_time: string
          title_en: string
          title_ta: string
          updated_at: string
          venue_en: string
          venue_ta: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_ta?: string
          end_time?: string
          event_date: string
          id?: string
          is_published?: boolean
          sort_order?: number
          start_time?: string
          title_en?: string
          title_ta?: string
          updated_at?: string
          venue_en?: string
          venue_ta?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_ta?: string
          end_time?: string
          event_date?: string
          id?: string
          is_published?: boolean
          sort_order?: number
          start_time?: string
          title_en?: string
          title_ta?: string
          updated_at?: string
          venue_en?: string
          venue_ta?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_en: string | null
          alt_ta: string | null
          created_at: string
          id: string
          storage_path: string
          title: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_en?: string | null
          alt_ta?: string | null
          created_at?: string
          id?: string
          storage_path: string
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_en?: string | null
          alt_ta?: string | null
          created_at?: string
          id?: string
          storage_path?: string
          title?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      program_access: {
        Row: {
          created_at: string
          id: string
          materials: Json
          program_label: string
          program_slug: string
          updated_at: string
          zoom_notes_en: string
          zoom_notes_ta: string
          zoom_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          materials?: Json
          program_label?: string
          program_slug: string
          updated_at?: string
          zoom_notes_en?: string
          zoom_notes_ta?: string
          zoom_url?: string
        }
        Update: {
          created_at?: string
          id?: string
          materials?: Json
          program_label?: string
          program_slug?: string
          updated_at?: string
          zoom_notes_en?: string
          zoom_notes_ta?: string
          zoom_url?: string
        }
        Relationships: []
      }
      program_dates: {
        Row: {
          capacity: number
          created_at: string
          format: string
          id: string
          is_open: boolean
          note_en: string
          note_ta: string
          program_label: string
          program_slug: string
          seats_taken: number
          session_date: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          format?: string
          id?: string
          is_open?: boolean
          note_en?: string
          note_ta?: string
          program_label?: string
          program_slug: string
          seats_taken?: number
          session_date: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          format?: string
          id?: string
          is_open?: boolean
          note_en?: string
          note_ta?: string
          program_label?: string
          program_slug?: string
          seats_taken?: number
          session_date?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_purchases: {
        Row: {
          amount_inr: number
          created_at: string
          currency: string
          email: string
          enrolment: Json
          full_name: string
          id: string
          payment_ref: string | null
          phone: string | null
          program_label: string
          program_slug: string
          provider: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_inr?: number
          created_at?: string
          currency?: string
          email: string
          enrolment?: Json
          full_name?: string
          id?: string
          payment_ref?: string | null
          phone?: string | null
          program_label?: string
          program_slug: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_inr?: number
          created_at?: string
          currency?: string
          email?: string
          enrolment?: Json
          full_name?: string
          id?: string
          payment_ref?: string | null
          phone?: string | null
          program_label?: string
          program_slug?: string
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
