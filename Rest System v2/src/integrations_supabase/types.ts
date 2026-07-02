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
      ai_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          input: Json | null
          lead_id: string | null
          model: string | null
          output: Json | null
          tenant_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          input?: Json | null
          lead_id?: string | null
          model?: string | null
          output?: Json | null
          tenant_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          input?: Json | null
          lead_id?: string | null
          model?: string | null
          output?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          action: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          trigger: string
        }
        Insert: {
          action?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          trigger: string
        }
        Update: {
          action?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_enabled: boolean | null
          channel: string | null
          created_at: string
          id: string
          last_message_at: string | null
          lead_id: string
          tenant_id: string
          unread_count: number | null
        }
        Insert: {
          ai_enabled?: boolean | null
          channel?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_id: string
          tenant_id: string
          unread_count?: number | null
        }
        Update: {
          ai_enabled?: boolean | null
          channel?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          lead_id?: string
          tenant_id?: string
          unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_products: {
        Row: {
          created_at: string
          customer_id: string
          due_at: string | null
          finished_at: string | null
          id: string
          product_id: string
          progress: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["delivery_status"] | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_at?: string | null
          finished_at?: string | null
          id?: string
          product_id: string
          progress?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"] | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_at?: string | null
          finished_at?: string | null
          id?: string
          product_id?: string
          progress?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"] | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          origin_lead_id: string | null
          owner_id: string | null
          phone: string | null
          renewal_date: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["customer_status"] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          origin_lead_id?: string | null
          owner_id?: string | null
          phone?: string | null
          renewal_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          origin_lead_id?: string | null
          owner_id?: string | null
          phone?: string | null
          renewal_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["customer_status"] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_origin_lead_id_fkey"
            columns: ["origin_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          kind: string | null
          lead_id: string | null
          name: string
          size_bytes: number | null
          tenant_id: string
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          kind?: string | null
          lead_id?: string | null
          name: string
          size_bytes?: number | null
          tenant_id: string
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          kind?: string | null
          lead_id?: string | null
          name?: string
          size_bytes?: number | null
          tenant_id?: string
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          attempt: number | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          notes: string | null
          scheduled_at: string
          script_id: string | null
          status: Database["public"]["Enums"]["followup_status"] | null
          tenant_id: string
        }
        Insert: {
          attempt?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          scheduled_at: string
          script_id?: string | null
          status?: Database["public"]["Enums"]["followup_status"] | null
          tenant_id: string
        }
        Update: {
          attempt?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          scheduled_at?: string
          script_id?: string | null
          status?: Database["public"]["Enums"]["followup_status"] | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_paused: boolean | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_message_at: string | null
          name: string
          next_followup_at: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          pipeline_id: string | null
          product_id: string | null
          source: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ai_paused?: boolean | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string | null
          name: string
          next_followup_at?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          product_id?: string | null
          source?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ai_paused?: boolean | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_message_at?: string | null
          name?: string
          next_followup_at?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          pipeline_id?: string | null
          product_id?: string | null
          source?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          sent_by: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          tenant_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          sent_by?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          tenant_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          sent_by?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          tenant_id?: string
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
            foreignKeyName: "messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          tenant_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          tenant_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          tenant_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          delivery_days: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          scope: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          scope?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          scope?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      scripts: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          notes: string | null
          performance_score: number | null
          product_id: string | null
          stage_id: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["script_type"]
          updated_at: string
          usage_count: number | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          performance_score?: number | null
          product_id?: string | null
          stage_id?: string | null
          tenant_id: string
          type?: Database["public"]["Enums"]["script_type"]
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          performance_score?: number | null
          product_id?: string | null
          stage_id?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["script_type"]
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          pipeline_id: string
          position: number
          tenant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          pipeline_id: string
          position?: number
          tenant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          pipeline_id?: string
          position?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_tenant_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tenant: string
          _user: string
        }
        Returns: boolean
      }
      is_tenant_member: {
        Args: { _tenant: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "gestor"
        | "sdr"
        | "closer"
        | "atendimento"
        | "operacao"
        | "financeiro"
        | "leitura"
      customer_status: "ativo" | "pausado" | "encerrado" | "em_onboarding"
      delivery_status: "pendente" | "em_andamento" | "concluido" | "atrasado"
      followup_status: "pendente" | "concluido" | "pulado" | "cancelado"
      lead_status:
        | "novo"
        | "em_andamento"
        | "follow_up"
        | "ganho"
        | "perdido"
        | "cliente"
      lead_temperature: "frio" | "morno" | "quente"
      message_role: "lead" | "agent" | "ai" | "system"
      message_status: "sent" | "delivered" | "read" | "failed"
      script_type:
        | "abertura"
        | "qualificacao"
        | "follow_up"
        | "objecao"
        | "agendamento"
        | "fechamento"
        | "reativacao"
        | "ia_base"
      task_status: "aberta" | "em_andamento" | "concluida" | "cancelada"
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
      app_role: [
        "admin",
        "gestor",
        "sdr",
        "closer",
        "atendimento",
        "operacao",
        "financeiro",
        "leitura",
      ],
      customer_status: ["ativo", "pausado", "encerrado", "em_onboarding"],
      delivery_status: ["pendente", "em_andamento", "concluido", "atrasado"],
      followup_status: ["pendente", "concluido", "pulado", "cancelado"],
      lead_status: [
        "novo",
        "em_andamento",
        "follow_up",
        "ganho",
        "perdido",
        "cliente",
      ],
      lead_temperature: ["frio", "morno", "quente"],
      message_role: ["lead", "agent", "ai", "system"],
      message_status: ["sent", "delivered", "read", "failed"],
      script_type: [
        "abertura",
        "qualificacao",
        "follow_up",
        "objecao",
        "agendamento",
        "fechamento",
        "reativacao",
        "ia_base",
      ],
      task_status: ["aberta", "em_andamento", "concluida", "cancelada"],
    },
  },
} as const
