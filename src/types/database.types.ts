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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      mundo_ceus: {
        Row: {
          ativo: boolean
          clima_visual: string
          cor_fase: string
          id: number
          nome_tema: string
          notebook_id: string | null
          ordem: number
          simbologia: string | null
        }
        Insert: {
          ativo?: boolean
          clima_visual: string
          cor_fase: string
          id?: number
          nome_tema: string
          notebook_id?: string | null
          ordem: number
          simbologia?: string | null
        }
        Update: {
          ativo?: boolean
          clima_visual?: string
          cor_fase?: string
          id?: number
          nome_tema?: string
          notebook_id?: string | null
          ordem?: number
          simbologia?: string | null
        }
        Relationships: []
      }
      pilulas: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          mundo_id: number
          ordem: number
          source_notebook_id: string | null
          titulo: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          mundo_id: number
          ordem: number
          source_notebook_id?: string | null
          titulo: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          mundo_id?: number
          ordem?: number
          source_notebook_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pilulas_mundo_id_fkey"
            columns: ["mundo_id"]
            isOneToOne: false
            referencedRelation: "mundo_ceus"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso: {
        Row: {
          id: string
          mundo_id: number
          pilula_atual: number
          pontuacao_local: number
          status: Database["public"]["Enums"]["status_progresso"]
          voluntario_id: string
        }
        Insert: {
          id?: string
          mundo_id: number
          pilula_atual?: number
          pontuacao_local?: number
          status?: Database["public"]["Enums"]["status_progresso"]
          voluntario_id: string
        }
        Update: {
          id?: string
          mundo_id?: number
          pilula_atual?: number
          pontuacao_local?: number
          status?: Database["public"]["Enums"]["status_progresso"]
          voluntario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_mundo_id_fkey"
            columns: ["mundo_id"]
            isOneToOne: false
            referencedRelation: "mundo_ceus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_voluntario_id_fkey"
            columns: ["voluntario_id"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          alternativas: Json
          created_at: string
          dificuldade: Database["public"]["Enums"]["dificuldade_quiz"]
          explicacao: string | null
          id: string
          ordem: number
          pergunta: string
          pilula_id: string
        }
        Insert: {
          alternativas: Json
          created_at?: string
          dificuldade?: Database["public"]["Enums"]["dificuldade_quiz"]
          explicacao?: string | null
          id?: string
          ordem: number
          pergunta: string
          pilula_id: string
        }
        Update: {
          alternativas?: Json
          created_at?: string
          dificuldade?: Database["public"]["Enums"]["dificuldade_quiz"]
          explicacao?: string | null
          id?: string
          ordem?: number
          pergunta?: string
          pilula_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_pilula_id_fkey"
            columns: ["pilula_id"]
            isOneToOne: false
            referencedRelation: "pilulas"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_quiz: {
        Row: {
          acertou: boolean
          id: string
          quiz_id: string
          respondido_em: string
          resposta_idx: number
          voluntario_id: string
        }
        Insert: {
          acertou: boolean
          id?: string
          quiz_id: string
          respondido_em?: string
          resposta_idx: number
          voluntario_id: string
        }
        Update: {
          acertou?: boolean
          id?: string
          quiz_id?: string
          respondido_em?: string
          resposta_idx?: number
          voluntario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_quiz_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_quiz_voluntario_id_fkey"
            columns: ["voluntario_id"]
            isOneToOne: false
            referencedRelation: "voluntarios"
            referencedColumns: ["id"]
          },
        ]
      }
      voluntarios: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          melhor_ofensiva: number
          metros_linha: number
          nome: string
          ofensiva_atual: number
          ultimo_acesso: string | null
          updated_at: string
          vidas_atuais: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          melhor_ofensiva?: number
          metros_linha?: number
          nome: string
          ofensiva_atual?: number
          ultimo_acesso?: string | null
          updated_at?: string
          vidas_atuais?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          melhor_ofensiva?: number
          metros_linha?: number
          nome?: string
          ofensiva_atual?: number
          ultimo_acesso?: string | null
          updated_at?: string
          vidas_atuais?: number
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
      dificuldade_quiz: "facil" | "medio" | "dificil"
      status_progresso: "bloqueado" | "ativo" | "concluido"
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
      dificuldade_quiz: ["facil", "medio", "dificil"],
      status_progresso: ["bloqueado", "ativo", "concluido"],
    },
  },
} as const

