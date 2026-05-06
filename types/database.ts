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
      categorias: {
        Row: {
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      consignacoes: {
        Row: {
          comissao_percentual: number
          created_at: string
          data_fim: string
          data_inicio: string
          fornecedor_id: string
          id: string
          observacoes: string | null
          preco_fornecedor: number
          produto_id: string
          quantidade_recebida: number
          status: string
          updated_at: string
        }
        Insert: {
          comissao_percentual?: number
          created_at?: string
          data_fim: string
          data_inicio: string
          fornecedor_id: string
          id?: string
          observacoes?: string | null
          preco_fornecedor: number
          produto_id: string
          quantidade_recebida: number
          status?: string
          updated_at?: string
        }
        Update: {
          comissao_percentual?: number
          created_at?: string
          data_fim?: string
          data_inicio?: string
          fornecedor_id?: string
          id?: string
          observacoes?: string | null
          preco_fornecedor?: number
          produto_id?: string
          quantidade_recebida?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consignacoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      formas_pagamento: {
        Row: {
          created_at: string
          icone: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          icone: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          icone?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          contato: string | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          contato?: string | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          contato?: string | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pedido_itens: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario_centavos: number
          produto_id: string | null
          produto_nome: string
          quantidade: number
          subtotal_centavos: number
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario_centavos: number
          produto_id?: string | null
          produto_nome: string
          quantidade: number
          subtotal_centavos: number
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario_centavos?: number
          produto_id?: string | null
          produto_nome?: string
          quantidade?: number
          subtotal_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cancelado_em: string | null
          cliente_cpf: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string
          cliente_whatsapp: string
          confirmado_em: string | null
          created_at: string
          id: string
          nfce_chave: string | null
          nfce_emitida_em: string | null
          nfce_erro: string | null
          nfce_numero: string | null
          nfce_url_pdf: string | null
          nfce_url_xml: string | null
          numero: number
          observacoes: string | null
          status: string
          sumup_checkout_id: string | null
          sumup_modo: string | null
          sumup_transaction_id: string | null
          tipo_pagamento: string
          total_centavos: number
          updated_at: string
        }
        Insert: {
          cancelado_em?: string | null
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cliente_whatsapp: string
          confirmado_em?: string | null
          created_at?: string
          id?: string
          nfce_chave?: string | null
          nfce_emitida_em?: string | null
          nfce_erro?: string | null
          nfce_numero?: string | null
          nfce_url_pdf?: string | null
          nfce_url_xml?: string | null
          numero?: number
          observacoes?: string | null
          status?: string
          sumup_checkout_id?: string | null
          sumup_modo?: string | null
          sumup_transaction_id?: string | null
          tipo_pagamento: string
          total_centavos: number
          updated_at?: string
        }
        Update: {
          cancelado_em?: string | null
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cliente_whatsapp?: string
          confirmado_em?: string | null
          created_at?: string
          id?: string
          nfce_chave?: string | null
          nfce_emitida_em?: string | null
          nfce_erro?: string | null
          nfce_numero?: string | null
          nfce_url_pdf?: string | null
          nfce_url_xml?: string | null
          numero?: number
          observacoes?: string | null
          status?: string
          sumup_checkout_id?: string | null
          sumup_modo?: string | null
          sumup_transaction_id?: string | null
          tipo_pagamento?: string
          total_centavos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          codigo_barras: string | null
          consignacao_id: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          quantidade: number
          quantidade_minima: number
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          consignacao_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number
          quantidade?: number
          quantidade_minima?: number
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          consignacao_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          quantidade?: number
          quantidade_minima?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_consignacao_id_fkey"
            columns: ["consignacao_id"]
            isOneToOne: false
            referencedRelation: "consignacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          id: number
          modo_catalogo: string
          pagamento_online_ativo: boolean
          pedidos_online_ativo: boolean
          retirada_local_ativa: boolean
          sumup_modo: string
          updated_at: string
        }
        Insert: {
          id?: number
          modo_catalogo?: string
          pagamento_online_ativo?: boolean
          pedidos_online_ativo?: boolean
          retirada_local_ativa?: boolean
          sumup_modo?: string
          updated_at?: string
        }
        Update: {
          id?: number
          modo_catalogo?: string
          pagamento_online_ativo?: boolean
          pedidos_online_ativo?: boolean
          retirada_local_ativa?: boolean
          sumup_modo?: string
          updated_at?: string
        }
        Relationships: []
      }
      venda_itens: {
        Row: {
          comissao_valor: number
          consignacao_id: string | null
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          venda_id: string
        }
        Insert: {
          comissao_valor?: number
          consignacao_id?: string | null
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          venda_id: string
        }
        Update: {
          comissao_valor?: number
          consignacao_id?: string | null
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_consignacao_id_fkey"
            columns: ["consignacao_id"]
            isOneToOne: false
            referencedRelation: "consignacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_pagamentos: {
        Row: {
          created_at: string
          forma_pagamento_id: string
          id: string
          valor: number
          venda_id: string
        }
        Insert: {
          created_at?: string
          forma_pagamento_id: string
          id?: string
          valor: number
          venda_id: string
        }
        Update: {
          created_at?: string
          forma_pagamento_id?: string
          id?: string
          valor?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_pagamentos_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          created_at: string
          desconto: number
          forma_pagamento_id: string | null
          id: string
          itens_count: number
          total: number
        }
        Insert: {
          created_at?: string
          desconto?: number
          forma_pagamento_id?: string | null
          id?: string
          itens_count?: number
          total?: number
        }
        Update: {
          created_at?: string
          desconto?: number
          forma_pagamento_id?: string | null
          id?: string
          itens_count?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirmar_pedido: { Args: { pedido_id_param: string }; Returns: Json }
      consignacao_resumo: {
        Args: { p_consignacao_id: string }
        Returns: {
          comissao_total: number
          quantidade_a_devolver: number
          quantidade_vendida: number
          receita_bruta: number
          valor_devido_fornecedor: number
        }[]
      }
      finalizar_venda:
        | { Args: { p_itens: Json }; Returns: string }
        | {
            Args: {
              p_desconto?: number
              p_forma_pagamento_id?: string
              p_itens: Json
            }
            Returns: string
          }
        | {
            Args: {
              p_desconto?: number
              p_forma_pagamento_id?: string
              p_itens: Json
              p_pagamentos?: Json
            }
            Returns: string
          }
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
