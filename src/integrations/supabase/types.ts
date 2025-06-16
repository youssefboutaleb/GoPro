export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      action_plans: {
        Row: {
          budget: number
          description: string | null
          execution_date: string
          id: string
          manager_id: string | null
          product_id: string | null
          territory_id: string | null
        }
        Insert: {
          budget: number
          description?: string | null
          execution_date: string
          id?: string
          manager_id?: string | null
          product_id?: string | null
          territory_id?: string | null
        }
        Update: {
          budget?: number
          description?: string | null
          execution_date?: string
          id?: string
          manager_id?: string | null
          product_id?: string | null
          territory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      delegates: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          name: string
          sector_id: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          name: string
          sector_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          name?: string
          sector_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delegates_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "supervisors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          first_name: string
          id: string
          name: string
          specialty: string | null
          territory_id: string | null
        }
        Insert: {
          first_name: string
          id?: string
          name: string
          specialty?: string | null
          territory_id?: string | null
        }
        Update: {
          first_name?: string
          id?: string
          name?: string
          specialty?: string | null
          territory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          first_name: string | null
          id: string
          name: string
          task: string | null
        }
        Insert: {
          first_name?: string | null
          id?: string
          name: string
          task?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string
          name?: string
          task?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          id: string
          name: string
          therapeutic_class: string | null
        }
        Insert: {
          active?: boolean | null
          id?: string
          name: string
          therapeutic_class?: string | null
        }
        Update: {
          active?: boolean | null
          id?: string
          name?: string
          therapeutic_class?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      sales: {
        Row: {
          delegate_id: string | null
          id: string
          product_id: string | null
          territory_id: string | null
        }
        Insert: {
          delegate_id?: string | null
          id?: string
          product_id?: string | null
          territory_id?: string | null
        }
        Update: {
          delegate_id?: string | null
          id?: string
          product_id?: string | null
          territory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "delegates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_objectives: {
        Row: {
          id: string
          monthly_objective: number[] | null
          sale_id: string | null
          sales_achieved: number[] | null
          year: number
        }
        Insert: {
          id?: string
          monthly_objective?: number[] | null
          sale_id?: string | null
          sales_achieved?: number[] | null
          year: number
        }
        Update: {
          id?: string
          monthly_objective?: number[] | null
          sale_id?: string | null
          sales_achieved?: number[] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_objectives_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      supervisors: {
        Row: {
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisors_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          description: string | null
          id: string
          name: string
          sector_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          sector_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "territories_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_frequencies: {
        Row: {
          delegate_id: string | null
          doctor_id: string | null
          id: string
          visit_frequency: number | null
        }
        Insert: {
          delegate_id?: string | null
          doctor_id?: string | null
          id?: string
          visit_frequency?: number | null
        }
        Update: {
          delegate_id?: string | null
          doctor_id?: string | null
          id?: string
          visit_frequency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_frequencies_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "delegates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_frequencies_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          id: string
          visit_date: string
          visit_objective_id: string | null
        }
        Insert: {
          id?: string
          visit_date: string
          visit_objective_id?: string | null
        }
        Update: {
          id?: string
          visit_date?: string
          visit_objective_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_visit_objective_id_fkey"
            columns: ["visit_objective_id"]
            isOneToOne: false
            referencedRelation: "visit_frequencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      set_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      doctor_specialty:
        | "cardiologue"
        | "generaliste"
        | "interniste"
        | "pneumologue"
      frequence_visite: "1" | "2"
      user_role: "superuser" | "admin" | "user"
      visit_status: "planifiee" | "realisee" | "annulee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      doctor_specialty: [
        "cardiologue",
        "generaliste",
        "interniste",
        "pneumologue",
      ],
      frequence_visite: ["1", "2"],
      user_role: ["superuser", "admin", "user"],
      visit_status: ["planifiee", "realisee", "annulee"],
    },
  },
} as const
