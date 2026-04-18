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
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          quantidade: number
          quantidade_minima: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number
          quantidade?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          quantidade?: number
          quantidade_minima?: number
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
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          venda_id: string
        }
        Insert: {
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          venda_id: string
        }
        Update: {
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          venda_id?: string
        }
        Relationships: [
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
