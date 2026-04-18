// ─── Generated database types (source of truth for Supabase client) ──────────
export type { Database } from './database';

// ─── Application-level interfaces ─────────────────────────────────────────────

export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  codigo_barras: string | null;
  nome: string;
  descricao: string | null;
  preco: number;
  quantidade: number;
  quantidade_minima: number;
  categoria_id: string | null;
  imagem_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: Categoria;
}

export interface Venda {
  id: string;
  total: number;
  desconto: number;
  itens_count: number;
  forma_pagamento_id: string | null;
  created_at: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  produto?: Produto;
}

export interface CartItem {
  produto_id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem_url: string | null;
}

export interface SiteConfig {
  id: number;
  modo_catalogo: 'copa' | 'catalogo';
  pedidos_online_ativo: boolean;
  pagamento_online_ativo: boolean;
  retirada_local_ativa: boolean;
  sumup_modo: 'sandbox' | 'producao';
  updated_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type PedidoStatus = 'pendente' | 'pago' | 'confirmado' | 'cancelado' | 'concluido';
export type TipoPagamento = 'online' | 'retirada_local';

export interface Pedido {
  id: string;
  numero: number;
  cliente_id: string | null;
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_email: string | null;
  cliente_cpf: string | null;
  tipo_pagamento: TipoPagamento;
  status: PedidoStatus;
  total_centavos: number;
  observacoes: string | null;
  sumup_checkout_id: string | null;
  sumup_transaction_id: string | null;
  sumup_modo: string | null;
  nfce_chave: string | null;
  nfce_numero: string | null;
  nfce_url_xml: string | null;
  nfce_url_pdf: string | null;
  nfce_emitida_em: string | null;
  nfce_erro: string | null;
  created_at: string;
  updated_at: string;
  confirmado_em: string | null;
  cancelado_em: string | null;
  itens?: PedidoItem[];
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  produto_nome: string;
  preco_unitario_centavos: number;
  quantidade: number;
  subtotal_centavos: number;
  created_at: string;
}
