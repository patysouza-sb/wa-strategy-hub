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
      ai_bots: {
        Row: {
          assigned_flow: string | null
          auto_transfer: boolean | null
          conversations: number
          created_at: string
          id: string
          keywords: string[] | null
          max_simultaneous: number | null
          name: string
          response_delay: number | null
          status: string
          training: string | null
          transfer_after: number | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          assigned_flow?: string | null
          auto_transfer?: boolean | null
          conversations?: number
          created_at?: string
          id?: string
          keywords?: string[] | null
          max_simultaneous?: number | null
          name: string
          response_delay?: number | null
          status?: string
          training?: string | null
          transfer_after?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          assigned_flow?: string | null
          auto_transfer?: boolean | null
          conversations?: number
          created_at?: string
          id?: string
          keywords?: string[] | null
          max_simultaneous?: number | null
          name?: string
          response_delay?: number | null
          status?: string
          training?: string | null
          transfer_after?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action: string
          created_at: string
          delay: string | null
          flow_name: string | null
          id: string
          message: string | null
          name: string
          status: string
          trigger: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action?: string
          created_at?: string
          delay?: string | null
          flow_name?: string | null
          id?: string
          message?: string | null
          name: string
          status?: string
          trigger?: string
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          delay?: string | null
          flow_name?: string | null
          id?: string
          message?: string | null
          name?: string
          status?: string
          trigger?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      flow_folders: {
        Row: {
          created_at: string
          id: string
          is_open: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      flows: {
        Row: {
          connections: Json
          created_at: string
          folder_id: string | null
          id: string
          name: string
          nodes: Json
          shortcut: string | null
          status: string
          updated_at: string
        }
        Insert: {
          connections?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          name: string
          nodes?: Json
          shortcut?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          connections?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          name?: string
          nodes?: Json
          shortcut?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flows_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "flow_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          closed_flow: string | null
          created_at: string
          default_flow: string | null
          id: string
          inactivity_time: string | null
          last_seen: string | null
          name: string
          phone: string
          status: string
          updated_at: string
          welcome_flow: string | null
        }
        Insert: {
          closed_flow?: string | null
          created_at?: string
          default_flow?: string | null
          id?: string
          inactivity_time?: string | null
          last_seen?: string | null
          name: string
          phone: string
          status?: string
          updated_at?: string
          welcome_flow?: string | null
        }
        Update: {
          closed_flow?: string | null
          created_at?: string
          default_flow?: string | null
          id?: string
          inactivity_time?: string | null
          last_seen?: string | null
          name?: string
          phone?: string
          status?: string
          updated_at?: string
          welcome_flow?: string | null
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
  public: {
    Enums: {},
  },
} as const
