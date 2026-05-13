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
      impressoes: {
        Row: {
          arquivo_nome: string | null
          arquivo_path: string
          cancelado_em: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string
          cliente_whatsapp: string
          concluido_em: string | null
          created_at: string
          id: string
          modo_cor: string
          numero: number
          observacoes: string | null
          pago_em: string | null
          preco_unitario_centavos: number
          quantidade_folhas: number
          status: string
          sumup_checkout_id: string | null
          sumup_modo: string | null
          sumup_transaction_id: string | null
          tipo_impressao_id: string | null
          tipo_impressao_nome: string
          tipo_pagamento: string
          total_centavos: number
          updated_at: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_path: string
          cancelado_em?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome: string
          cliente_whatsapp: string
          concluido_em?: string | null
          created_at?: string
          id?: string
          modo_cor: string
          numero?: number
          observacoes?: string | null
          pago_em?: string | null
          preco_unitario_centavos: number
          quantidade_folhas: number
          status?: string
          sumup_checkout_id?: string | null
          sumup_modo?: string | null
          sumup_transaction_id?: string | null
          tipo_impressao_id?: string | null
          tipo_impressao_nome: string
          tipo_pagamento: string
          total_centavos: number
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_path?: string
          cancelado_em?: string | null
          cliente_email?: string | null
          cliente_id?: string | null
          cliente_nome?: string
          cliente_whatsapp?: string
          concluido_em?: string | null
          created_at?: string
          id?: string
          modo_cor?: string
          numero?: number
          observacoes?: string | null
          pago_em?: string | null
          preco_unitario_centavos?: number
          quantidade_folhas?: number
          status?: string
          sumup_checkout_id?: string | null
          sumup_modo?: string | null
          sumup_transaction_id?: string | null
          tipo_impressao_id?: string | null
          tipo_impressao_nome?: string
          tipo_pagamento?: string
          total_centavos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impressoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impressoes_tipo_impressao_id_fkey"
            columns: ["tipo_impressao_id"]
            isOneToOne: false
            referencedRelation: "tipos_impressao"
            referencedColumns: ["id"]
          },
        ]
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
          impressao_preco_colorida_centavos: number
          impressao_preco_pb_centavos: number
          impressoes_ativa: boolean
          modo_catalogo: string
          pagamento_online_ativo: boolean
          pedidos_online_ativo: boolean
          retirada_local_ativa: boolean
          sumup_modo: string
          updated_at: string
        }
        Insert: {
          id?: number
          impressao_preco_colorida_centavos?: number
          impressao_preco_pb_centavos?: number
          impressoes_ativa?: boolean
          modo_catalogo?: string
          pagamento_online_ativo?: boolean
          pedidos_online_ativo?: boolean
          retirada_local_ativa?: boolean
          sumup_modo?: string
          updated_at?: string
        }
        Update: {
          id?: number
          impressao_preco_colorida_centavos?: number
          impressao_preco_pb_centavos?: number
          impressoes_ativa?: boolean
          modo_catalogo?: string
          pagamento_online_ativo?: boolean
          pedidos_online_ativo?: boolean
          retirada_local_ativa?: boolean
          sumup_modo?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipos_impressao: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
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
    Views: { [_ in never]: never }
    Functions: {
      cancelar_pedido: {
        Args: { motivo_param?: string; pedido_id_param: string }
        Returns: undefined
      }
      confirmar_pedido: {
        Args: { pedido_id_param: string }
        Returns: undefined
      }
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
      finalizar_venda: {
        Args: {
          p_desconto?: number
          p_forma_pagamento_id?: string
          p_itens: Json
          p_pagamentos?: Json
        }
        Returns: string
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
