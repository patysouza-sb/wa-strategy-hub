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
      ai_agent_configs: {
        Row: {
          agent_id: string
          extra_config: Json
          id: string
          max_tokens: number
          system_prompt: string | null
          temperature: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          extra_config?: Json
          id?: string
          max_tokens?: number
          system_prompt?: string | null
          temperature?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          extra_config?: Json
          id?: string
          max_tokens?: number
          system_prompt?: string | null
          temperature?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          created_at: string
          id: string
          instance_id: string | null
          model: string
          name: string
          status: string
          tenant_id: string
          tokens_used: number
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id?: string | null
          model?: string
          name: string
          status?: string
          tenant_id: string
          tokens_used?: number
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string | null
          model?: string
          name?: string
          status?: string
          tenant_id?: string
          tokens_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_flows: {
        Row: {
          channel_type: string
          created_at: string
          created_by: string | null
          folder_id: string | null
          id: string
          name: string
          shortcut: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          channel_type?: string
          created_at?: string
          created_by?: string | null
          folder_id?: string | null
          id?: string
          name: string
          shortcut?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          channel_type?: string
          created_at?: string
          created_by?: string | null
          folder_id?: string | null
          id?: string
          name?: string
          shortcut?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_flows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_flows_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "flow_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_flows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_flows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          automation_id: string
          conditions: Json
          delay_hours: number
          id: string
          trigger_type: string
        }
        Insert: {
          automation_id: string
          conditions?: Json
          delay_hours?: number
          id?: string
          trigger_type: string
        }
        Update: {
          automation_id?: string
          conditions?: Json
          delay_hours?: number
          id?: string
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          channel_type: string
          flow_id: string | null
          id: string
          name: string
          status: string
          tenant_id: string
        }
        Insert: {
          channel_type?: string
          flow_id?: string | null
          id?: string
          name: string
          status?: string
          tenant_id: string
        }
        Update: {
          channel_type?: string
          flow_id?: string | null
          id?: string
          name?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          contact_id: string
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          contact_id: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          contact_id?: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_tag_filters: {
        Row: {
          broadcast_id: string
          tag_id: string
        }
        Insert: {
          broadcast_id: string
          tag_id: string
        }
        Update: {
          broadcast_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_tag_filters_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_tag_filters_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          channel_id: string | null
          channel_type: string
          created_at: string
          created_by: string | null
          flow_id: string | null
          id: string
          name: string
          scheduled_at: string | null
          status: string
          tenant_id: string
          type: string
        }
        Insert: {
          channel_id?: string | null
          channel_type?: string
          created_at?: string
          created_by?: string | null
          flow_id?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          status?: string
          tenant_id: string
          type?: string
        }
        Update: {
          channel_id?: string | null
          channel_type?: string
          created_at?: string
          created_by?: string | null
          flow_id?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          close_at: string | null
          day_of_week: string
          id: string
          is_active: boolean
          open_at: string | null
          tenant_id: string
        }
        Insert: {
          close_at?: string | null
          day_of_week: string
          id?: string
          is_active?: boolean
          open_at?: string | null
          tenant_id: string
        }
        Update: {
          close_at?: string | null
          day_of_week?: string
          id?: string
          is_active?: boolean
          open_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_hours_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          contact_id: string
          id: string
          status: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          id?: string
          status?: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          scheduled_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          scheduled_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          agent_ia_label: string | null
          auth_type: string | null
          channel_type: string
          closed_flow_id: string | null
          created_at: string
          default_response_delay_unit: string
          default_response_delay_value: number
          default_response_flow_id: string | null
          display_name: string
          id: string
          is_default: boolean
          last_connected_at: string | null
          phone_number: string | null
          proxy_url: string | null
          qr_code: string | null
          status: string
          tenant_id: string
          token: string | null
          use_proxy: boolean
          welcome_flow_id: string | null
        }
        Insert: {
          agent_ia_label?: string | null
          auth_type?: string | null
          channel_type?: string
          closed_flow_id?: string | null
          created_at?: string
          default_response_delay_unit?: string
          default_response_delay_value?: number
          default_response_flow_id?: string | null
          display_name: string
          id?: string
          is_default?: boolean
          last_connected_at?: string | null
          phone_number?: string | null
          proxy_url?: string | null
          qr_code?: string | null
          status?: string
          tenant_id: string
          token?: string | null
          use_proxy?: boolean
          welcome_flow_id?: string | null
        }
        Update: {
          agent_ia_label?: string | null
          auth_type?: string | null
          channel_type?: string
          closed_flow_id?: string | null
          created_at?: string
          default_response_delay_unit?: string
          default_response_delay_value?: number
          default_response_flow_id?: string | null
          display_name?: string
          id?: string
          is_default?: boolean
          last_connected_at?: string | null
          phone_number?: string | null
          proxy_url?: string | null
          qr_code?: string | null
          status?: string
          tenant_id?: string
          token?: string | null
          use_proxy?: boolean
          welcome_flow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_closed_flow_id_fkey"
            columns: ["closed_flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_default_response_flow_id_fkey"
            columns: ["default_response_flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_welcome_flow_id_fkey"
            columns: ["welcome_flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_custom_fields: {
        Row: {
          contact_id: string
          field_id: string
          id: string
          value: string | null
        }
        Insert: {
          contact_id: string
          field_id: string
          id?: string
          value?: string | null
        }
        Update: {
          contact_id?: string
          field_id?: string
          id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_custom_fields_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_custom_fields_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_group_members: {
        Row: {
          contact_id: string
          group_id: string
        }
        Insert: {
          contact_id: string
          group_id: string
        }
        Update: {
          contact_id?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_group_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "contact_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_groups: {
        Row: {
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          instance_id: string | null
          last_seen: string | null
          name: string | null
          phone_number: string
          tenant_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          last_seen?: string | null
          name?: string | null
          phone_number: string
          tenant_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          instance_id?: string | null
          last_seen?: string | null
          name?: string | null
          phone_number?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_audit_logs: {
        Row: {
          action: string
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          id: string
          metadata: Json
          notes: string | null
          performed_by_name: string | null
          performed_by_user_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          performed_by_name?: string | null
          performed_by_user_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          notes?: string | null
          performed_by_name?: string | null
          performed_by_user_id?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ai_agent_id: string | null
          assigned_team_id: string | null
          assigned_user_id: string | null
          channel_id: string | null
          channel_type: string
          contact_id: string
          created_at: string
          department_id: string | null
          id: string
          kanban_column_id: string | null
          last_message_at: string | null
          queue_status: string
          resolved_at: string | null
        }
        Insert: {
          ai_agent_id?: string | null
          assigned_team_id?: string | null
          assigned_user_id?: string | null
          channel_id?: string | null
          channel_type?: string
          contact_id: string
          created_at?: string
          department_id?: string | null
          id?: string
          kanban_column_id?: string | null
          last_message_at?: string | null
          queue_status?: string
          resolved_at?: string | null
        }
        Update: {
          ai_agent_id?: string | null
          assigned_team_id?: string | null
          assigned_user_id?: string | null
          channel_id?: string | null
          channel_type?: string
          contact_id?: string
          created_at?: string
          department_id?: string | null
          id?: string
          kanban_column_id?: string | null
          last_message_at?: string | null
          queue_status?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assigned_team_id_fkey"
            columns: ["assigned_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_kanban_column_id_fkey"
            columns: ["kanban_column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          field_type: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          field_type?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          field_type?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          attendances_done: number
          conversations_open: number
          conversations_pending: number
          conversations_resolved: number
          id: string
          leads_count: number
          messages_sent: number
          stat_date: string
          tenant_id: string
        }
        Insert: {
          attendances_done?: number
          conversations_open?: number
          conversations_pending?: number
          conversations_resolved?: number
          id?: string
          leads_count?: number
          messages_sent?: number
          stat_date: string
          tenant_id: string
        }
        Update: {
          attendances_done?: number
          conversations_open?: number
          conversations_pending?: number
          conversations_resolved?: number
          id?: string
          leads_count?: number
          messages_sent?: number
          stat_date?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_stats_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_stats_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_connections: {
        Row: {
          condition_label: string | null
          flow_id: string | null
          from_node_id: string
          from_output_key: string | null
          id: string
          to_node_id: string
        }
        Insert: {
          condition_label?: string | null
          flow_id?: string | null
          from_node_id: string
          from_output_key?: string | null
          id?: string
          to_node_id: string
        }
        Update: {
          condition_label?: string | null
          flow_id?: string | null
          from_node_id?: string
          from_output_key?: string | null
          id?: string
          to_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_connections_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_connections_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_connections_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          path: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          path?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          path?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "flow_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_nodes: {
        Row: {
          config: Json
          flow_id: string
          id: string
          pos_x: number
          pos_y: number
          type: string
        }
        Insert: {
          config?: Json
          flow_id: string
          id?: string
          pos_x?: number
          pos_y?: number
          type: string
        }
        Update: {
          config?: Json
          flow_id?: string
          id?: string
          pos_x?: number
          pos_y?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      global_variables: {
        Row: {
          id: string
          name: string
          tenant_id: string
          value: string | null
        }
        Insert: {
          id?: string
          name: string
          tenant_id: string
          value?: string | null
        }
        Update: {
          id?: string
          name?: string
          tenant_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_variables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_variables_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      group_manager_groups: {
        Row: {
          created_at: string
          flow_id: string | null
          id: string
          name: string
          tenant_id: string
          whatsapp_group_id: string | null
        }
        Insert: {
          created_at?: string
          flow_id?: string | null
          id?: string
          name: string
          tenant_id: string
          whatsapp_group_id?: string | null
        }
        Update: {
          created_at?: string
          flow_id?: string | null
          id?: string
          name?: string
          tenant_id?: string
          whatsapp_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_manager_groups_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_manager_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_manager_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      group_manager_members: {
        Row: {
          contact_id: string
          group_id: string
          id: string
          joined_at: string
        }
        Insert: {
          contact_id: string
          group_id: string
          id?: string
          joined_at?: string
        }
        Update: {
          contact_id?: string
          group_id?: string
          id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_manager_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_manager_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_manager_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          integration_id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          integration_id: string
          payload?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          integration_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          status: string
          tenant_id: string
          type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          status?: string
          tenant_id: string
          type: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          status?: string
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          color: string
          id: string
          name: string
          position: number
          tenant_id: string
          trigger_flow_id: string | null
        }
        Insert: {
          color?: string
          id?: string
          name: string
          position?: number
          tenant_id: string
          trigger_flow_id?: string | null
        }
        Update: {
          color?: string
          id?: string
          name?: string
          position?: number
          tenant_id?: string
          trigger_flow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_columns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_columns_trigger_flow_id_fkey"
            columns: ["trigger_flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "libraries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "libraries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audio_transcript: string | null
          content: string | null
          conversation_id: string
          direction: string
          id: string
          is_audio_transcribed: boolean
          media_url: string | null
          sender_user_id: string | null
          sent_at: string
          status: string
          type: string
        }
        Insert: {
          audio_transcript?: string | null
          content?: string | null
          conversation_id: string
          direction: string
          id?: string
          is_audio_transcribed?: boolean
          media_url?: string | null
          sender_user_id?: string | null
          sent_at?: string
          status?: string
          type?: string
        }
        Update: {
          audio_transcript?: string | null
          content?: string | null
          conversation_id?: string
          direction?: string
          id?: string
          is_audio_transcribed?: boolean
          media_url?: string | null
          sender_user_id?: string | null
          sent_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      node_action_configs: {
        Row: {
          action_type: string
          http_body: Json | null
          http_method: string | null
          http_url: string | null
          id: string
          node_id: string
          position: number
          tag_id: string | null
          target_flow_id: string | null
          variable_name: string | null
          variable_value: string | null
        }
        Insert: {
          action_type: string
          http_body?: Json | null
          http_method?: string | null
          http_url?: string | null
          id?: string
          node_id: string
          position?: number
          tag_id?: string | null
          target_flow_id?: string | null
          variable_name?: string | null
          variable_value?: string | null
        }
        Update: {
          action_type?: string
          http_body?: Json | null
          http_method?: string | null
          http_url?: string | null
          id?: string
          node_id?: string
          position?: number
          tag_id?: string | null
          target_flow_id?: string | null
          variable_name?: string | null
          variable_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "node_action_configs_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_action_configs_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "node_action_configs_target_flow_id_fkey"
            columns: ["target_flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      node_content_items: {
        Row: {
          contact_name: string | null
          contact_phone: string | null
          id: string
          interval_seconds: number | null
          item_type: string
          media_filename: string | null
          media_url: string | null
          node_id: string
          position: number
          send_as_recorded: boolean | null
          text_bold: boolean | null
          text_content: string | null
          text_italic: boolean | null
          text_strikethrough: boolean | null
        }
        Insert: {
          contact_name?: string | null
          contact_phone?: string | null
          id?: string
          interval_seconds?: number | null
          item_type: string
          media_filename?: string | null
          media_url?: string | null
          node_id: string
          position?: number
          send_as_recorded?: boolean | null
          text_bold?: boolean | null
          text_content?: string | null
          text_italic?: boolean | null
          text_strikethrough?: boolean | null
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string | null
          id?: string
          interval_seconds?: number | null
          item_type?: string
          media_filename?: string | null
          media_url?: string | null
          node_id?: string
          position?: number
          send_as_recorded?: boolean | null
          text_bold?: boolean | null
          text_content?: string | null
          text_italic?: boolean | null
          text_strikethrough?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "node_content_items_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_menu_options: {
        Row: {
          id: string
          keyword: string | null
          label: string
          node_id: string
          position: number
        }
        Insert: {
          id?: string
          keyword?: string | null
          label: string
          node_id: string
          position?: number
        }
        Update: {
          id?: string
          keyword?: string | null
          label?: string
          node_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_menu_options_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_randomizer_options: {
        Row: {
          id: string
          node_id: string
          percentage: number
          position: number
        }
        Insert: {
          id?: string
          node_id: string
          percentage?: number
          position?: number
        }
        Update: {
          id?: string
          node_id?: string
          percentage?: number
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_randomizer_options_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      node_save_configs: {
        Row: {
          accept_media_as_response: boolean
          id: string
          max_retry_attempts: number | null
          message_before_wait: string | null
          node_id: string
          save_field_name: string | null
          wait_time_unit: string
          wait_time_value: number
        }
        Insert: {
          accept_media_as_response?: boolean
          id?: string
          max_retry_attempts?: number | null
          message_before_wait?: string | null
          node_id: string
          save_field_name?: string | null
          wait_time_unit?: string
          wait_time_value?: number
        }
        Update: {
          accept_media_as_response?: boolean
          id?: string
          max_retry_attempts?: number | null
          message_before_wait?: string | null
          node_id?: string
          save_field_name?: string | null
          wait_time_unit?: string
          wait_time_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "node_save_configs_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: true
            referencedRelation: "flow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          kiwify_product_id: string | null
          max_channels: number | null
          max_users: number | null
          name: string
          price_cents: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          kiwify_product_id?: string | null
          max_channels?: number | null
          max_users?: number | null
          name: string
          price_cents: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          kiwify_product_id?: string | null
          max_channels?: number | null
          max_users?: number | null
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          content: string
          id: string
          media_url: string | null
          shortcut: string
          tenant_id: string
        }
        Insert: {
          content: string
          id?: string
          media_url?: string | null
          shortcut: string
          tenant_id: string
        }
        Update: {
          content?: string
          id?: string
          media_url?: string | null
          shortcut?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_replies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_replies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      remarketing_executions: {
        Row: {
          contact_id: string
          executed_at: string
          id: string
          rule_id: string
        }
        Insert: {
          contact_id: string
          executed_at?: string
          id?: string
          rule_id: string
        }
        Update: {
          contact_id?: string
          executed_at?: string
          id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remarketing_executions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarketing_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "remarketing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      remarketing_rules: {
        Row: {
          days_since_last_contact: number
          id: string
          name: string
          status: string
          tenant_id: string
        }
        Insert: {
          days_since_last_contact?: number
          id?: string
          name: string
          status?: string
          tenant_id: string
        }
        Update: {
          days_since_last_contact?: number
          id?: string
          name?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remarketing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarketing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          source: string
          subscription_id: string | null
          tenant_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          source?: string
          subscription_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          source?: string
          subscription_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          blocked_at: string | null
          created_at: string
          current_period_end: string | null
          expires_at: string | null
          id: string
          is_trial: boolean
          kiwify_customer_email: string | null
          kiwify_order_id: string | null
          last_payment_at: string | null
          max_ai_agent_tokens: number
          max_whatsapp_instances: number
          plan_id: string | null
          plan_name: string
          status: string
          tenant_id: string
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          is_trial?: boolean
          kiwify_customer_email?: string | null
          kiwify_order_id?: string | null
          last_payment_at?: string | null
          max_ai_agent_tokens?: number
          max_whatsapp_instances?: number
          plan_id?: string | null
          plan_name: string
          status?: string
          tenant_id: string
        }
        Update: {
          blocked_at?: string | null
          created_at?: string
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          is_trial?: boolean
          kiwify_customer_email?: string | null
          kiwify_order_id?: string | null
          last_payment_at?: string | null
          max_ai_agent_tokens?: number
          max_whatsapp_instances?: number
          plan_id?: string | null
          plan_name?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          id: string
          is_custom_color: boolean
          name: string
          tenant_id: string
        }
        Insert: {
          color?: string
          id?: string
          is_custom_color?: boolean
          name: string
          tenant_id: string
        }
        Update: {
          color?: string
          id?: string
          is_custom_color?: boolean
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accept_calls: boolean
          billing_email: string | null
          company_name: string
          created_at: string
          id: string
          separate_by_user: boolean
          status: string
          subdomain: string
          transcribe_audio: boolean
        }
        Insert: {
          accept_calls?: boolean
          billing_email?: string | null
          company_name: string
          created_at?: string
          id?: string
          separate_by_user?: boolean
          status?: string
          subdomain: string
          transcribe_audio?: boolean
        }
        Update: {
          accept_calls?: boolean
          billing_email?: string | null
          company_name?: string
          created_at?: string
          id?: string
          separate_by_user?: boolean
          status?: string
          subdomain?: string
          transcribe_audio?: boolean
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          id: string
          name: string
          role: string
          team_id: string | null
          tenant_id: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          id?: string
          name: string
          role?: string
          team_id?: string | null
          tenant_id: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          secret: string | null
          status: string
          tenant_id: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          secret?: string | null
          status?: string
          tenant_id: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          secret?: string | null
          status?: string
          tenant_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      tenants_safe: {
        Row: {
          billing_email: string | null
          company_name: string | null
          id: string | null
          status: string | null
          subdomain: string | null
        }
        Insert: {
          billing_email?: never
          company_name?: string | null
          id?: string | null
          status?: string | null
          subdomain?: string | null
        }
        Update: {
          billing_email?: never
          company_name?: string | null
          id?: string | null
          status?: string | null
          subdomain?: string | null
        }
        Relationships: []
      }
      webhooks_safe: {
        Row: {
          created_at: string | null
          events: string[] | null
          id: string | null
          status: string | null
          tenant_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          id?: string | null
          status?: string | null
          tenant_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          id?: string | null
          status?: string | null
          tenant_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_subscription_active: { Args: never; Returns: boolean }
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
