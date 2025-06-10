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
          description: string | null
          id: string
          name: string | null
          nom: string
          region: string | null
          secteur_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name?: string | null
          nom: string
          region?: string | null
          secteur_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string | null
          nom?: string
          region?: string | null
          secteur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bricks_secteur_id_fkey"
            columns: ["secteur_id"]
            isOneToOne: false
            referencedRelation: "secteur"
            referencedColumns: ["id"]
          },
        ]
      }
      delegue_medecins: {
        Row: {
          delegue_id: string | null
          frequence_visite: string | null
          id: string
          medecin_id: string | null
        }
        Insert: {
          delegue_id?: string | null
          frequence_visite?: string | null
          id?: string
          medecin_id?: string | null
        }
        Update: {
          delegue_id?: string | null
          frequence_visite?: string | null
          id?: string
          medecin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delegue_medecins_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegue_medecins_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
        ]
      }
      delegue_produits: {
        Row: {
          delegue_id: string | null
          id: string
          produit_id: string | null
        }
        Insert: {
          delegue_id?: string | null
          id?: string
          produit_id?: string | null
        }
        Update: {
          delegue_id?: string | null
          id?: string
          produit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delegue_produits_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegue_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      delegues: {
        Row: {
          created_at: string | null
          equipe_id: string | null
          id: string
          nom: string
          prenom: string
          secteur_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          equipe_id?: string | null
          id?: string
          nom: string
          prenom: string
          secteur_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          equipe_id?: string | null
          id?: string
          nom?: string
          prenom?: string
          secteur_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delegues_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegues_secteur_id_fkey"
            columns: ["secteur_id"]
            isOneToOne: false
            referencedRelation: "secteur"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          id: string
          nom: string
        }
        Insert: {
          id?: string
          nom: string
        }
        Update: {
          id?: string
          nom?: string
        }
        Relationships: []
      }
      medecins: {
        Row: {
          brick_id: string | null
          id: string
          nom: string
          prenom: string
          specialite: string | null
        }
        Insert: {
          brick_id?: string | null
          id?: string
          nom: string
          prenom: string
          specialite?: string | null
        }
        Update: {
          brick_id?: string | null
          id?: string
          nom?: string
          prenom?: string
          specialite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medecins_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
        ]
      }
      objectifs_produits: {
        Row: {
          delegue_id: string | null
          id: string
          "id-brick": string | null
          objectif_annuel: number | null
          objectif_mensuel: number | null
          periode: string
          produit_id: string | null
        }
        Insert: {
          delegue_id?: string | null
          id?: string
          "id-brick"?: string | null
          objectif_annuel?: number | null
          objectif_mensuel?: number | null
          periode: string
          produit_id?: string | null
        }
        Update: {
          delegue_id?: string | null
          id?: string
          "id-brick"?: string | null
          objectif_annuel?: number | null
          objectif_mensuel?: number | null
          periode?: string
          produit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectifs_produits_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectifs_produits_id-brick_fkey"
            columns: ["id-brick"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectifs_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      produits: {
        Row: {
          actif: boolean | null
          classe_therapeutique: string | null
          id: string
          nom: string
        }
        Insert: {
          actif?: boolean | null
          classe_therapeutique?: string | null
          id?: string
          nom: string
        }
        Update: {
          actif?: boolean | null
          classe_therapeutique?: string | null
          id?: string
          nom?: string
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
      profils: {
        Row: {
          created_at: string | null
          id: string
          nom: string | null
          prenom: string | null
          secteur_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          secteur_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          secteur_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profils_secteur_id_fkey"
            columns: ["secteur_id"]
            isOneToOne: false
            referencedRelation: "secteur"
            referencedColumns: ["id"]
          },
        ]
      }
      rapports_mensuels: {
        Row: {
          delegue_id: string | null
          id: string
          medecin_id: string | null
          mois: string | null
          nombre_visites: number | null
          statut: string | null
        }
        Insert: {
          delegue_id?: string | null
          id?: string
          medecin_id?: string | null
          mois?: string | null
          nombre_visites?: number | null
          statut?: string | null
        }
        Update: {
          delegue_id?: string | null
          id?: string
          medecin_id?: string | null
          mois?: string | null
          nombre_visites?: number | null
          statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rapports_mensuels_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_mensuels_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
            referencedColumns: ["id"]
          },
        ]
      }
      secteur: {
        Row: {
          id: string
          nom: string
        }
        Insert: {
          id?: string
          nom: string
        }
        Update: {
          id?: string
          nom?: string
        }
        Relationships: []
      }
      ventes_produits: {
        Row: {
          brick_id: string | null
          delegue_id: string | null
          id: string
          montant: number
          periode: string
          produit_id: string | null
          source: string | null
        }
        Insert: {
          brick_id?: string | null
          delegue_id?: string | null
          id?: string
          montant: number
          periode: string
          produit_id?: string | null
          source?: string | null
        }
        Update: {
          brick_id?: string | null
          delegue_id?: string | null
          id?: string
          montant?: number
          periode?: string
          produit_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventes_produits_brick_id_fkey"
            columns: ["brick_id"]
            isOneToOne: false
            referencedRelation: "bricks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_produits_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      visites: {
        Row: {
          date_visite: string
          delegue_id: string | null
          id: string
          medecin_id: string | null
        }
        Insert: {
          date_visite: string
          delegue_id?: string | null
          id?: string
          medecin_id?: string | null
        }
        Update: {
          date_visite?: string
          delegue_id?: string | null
          id?: string
          medecin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visites_delegue_id_fkey"
            columns: ["delegue_id"]
            isOneToOne: false
            referencedRelation: "delegues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visites_medecin_id_fkey"
            columns: ["medecin_id"]
            isOneToOne: false
            referencedRelation: "medecins"
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
