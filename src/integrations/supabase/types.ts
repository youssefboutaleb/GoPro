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
      bricks: {
        Row: {
          id: string
          name: string
          sector_id: string | null
        }
        Insert: {
          id?: string
          name: string
          sector_id?: string | null
        }
        Update: {
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
      doctors: {
        Row: {
          brick_id: string | null
          first_name: string
          id: string
          last_name: string
          specialty: string | null
        }
        Insert: {
          brick_id?: string | null
          first_name: string
          id?: string
          last_name: string
          specialty?: string | null
        }
        Update: {
          brick_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          specialty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          therapeutic_class:
            | Database["public"]["Enums"]["therapeutic_class"]
            | null
        }
        Insert: {
          id?: string
          name: string
          therapeutic_class?:
            | Database["public"]["Enums"]["therapeutic_class"]
            | null
        }
        Update: {
          id?: string
          name?: string
          therapeutic_class?:
            | Database["public"]["Enums"]["therapeutic_class"]
            | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["role_type"]
          supervisor_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["role_type"]
          supervisor_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          role?: Database["public"]["Enums"]["role_type"]
          supervisor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          achievements: number[] | null
          id: string
          sales_plan_id: string | null
          targets: number[] | null
          year: number
        }
        Insert: {
          achievements?: number[] | null
          id?: string
          sales_plan_id?: string | null
          targets?: number[] | null
          year: number
        }
        Update: {
          achievements?: number[] | null
          id?: string
          sales_plan_id?: string | null
          targets?: number[] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_sales_sales_plan"
            columns: ["sales_plan_id"]
            isOneToOne: false
            referencedRelation: "sales_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sales_plan_id_fkey"
            columns: ["sales_plan_id"]
            isOneToOne: false
            referencedRelation: "sales_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_plans: {
        Row: {
          brick_id: string | null
          delegate_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          brick_id?: string | null
          delegate_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          brick_id?: string | null
          delegate_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sales_plans_brick"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_plans_delegate"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_plans_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_plans_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_plans_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      visit_plans: {
        Row: {
          delegate_id: string
          doctor_id: string | null
          id: string
          visit_frequency: Database["public"]["Enums"]["visit_frequency"]
        }
        Insert: {
          delegate_id: string
          doctor_id?: string | null
          id?: string
          visit_frequency: Database["public"]["Enums"]["visit_frequency"]
        }
        Update: {
          delegate_id?: string
          doctor_id?: string | null
          id?: string
          visit_frequency?: Database["public"]["Enums"]["visit_frequency"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_visit_plans_delegate"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visit_plans_doctor"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_frequencies_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_plans_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          id: string
          visit_date: string
          visit_plan_id: string | null
        }
        Insert: {
          id?: string
          visit_date: string
          visit_plan_id?: string | null
        }
        Update: {
          id?: string
          visit_date?: string
          visit_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visits_visit_plan"
            columns: ["visit_plan_id"]
            isOneToOne: false
            referencedRelation: "visit_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_visit_plan_id_fkey"
            columns: ["visit_plan_id"]
            isOneToOne: false
            referencedRelation: "visit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_profile: {
        Args: { profile_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_sales_director: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_supervisor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_supervisor_of: {
        Args: { delegate_id: string }
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
      role_type:
        | "Admin"
        | "Sales Director"
        | "Marketing Manager"
        | "Supervisor"
        | "Delegate"
      therapeutic_class: "Cardiology" | "Fever" | "Pain Killer"
      visit_frequency: "1" | "2"
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
      role_type: [
        "Admin",
        "Sales Director",
        "Marketing Manager",
        "Supervisor",
        "Delegate",
      ],
      therapeutic_class: ["Cardiology", "Fever", "Pain Killer"],
      visit_frequency: ["1", "2"],
    },
  },
} as const
