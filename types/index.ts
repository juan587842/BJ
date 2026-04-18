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
  itens_count: number;
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
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: Categoria;
        Insert: { nome: string; descricao?: string | null; icone?: string | null };
        Update: { nome?: string; descricao?: string | null; icone?: string | null };
      };
      produtos: {
        Row: Produto;
        Insert: {
          codigo_barras?: string | null;
          nome: string;
          descricao?: string | null;
          preco?: number;
          quantidade?: number;
          quantidade_minima?: number;
          categoria_id?: string | null;
          imagem_url?: string | null;
          ativo?: boolean;
        };
        Update: {
          codigo_barras?: string | null;
          nome?: string;
          descricao?: string | null;
          preco?: number;
          quantidade?: number;
          quantidade_minima?: number;
          categoria_id?: string | null;
          imagem_url?: string | null;
          ativo?: boolean;
        };
      };
      vendas: {
        Row: Venda;
        Insert: { total?: number; itens_count?: number };
        Update: { total?: number; itens_count?: number };
      };
      venda_itens: {
        Row: VendaItem;
        Insert: { venda_id: string; produto_id: string; quantidade: number; preco_unitario: number };
        Update: { venda_id?: string; produto_id?: string; quantidade?: number; preco_unitario?: number };
      };
      site_config: {
        Row: SiteConfig;
        Insert: { id?: number; modo_catalogo?: 'copa' | 'catalogo' };
        Update: { modo_catalogo?: 'copa' | 'catalogo' };
      };
    };
    Functions: {
      finalizar_venda: {
        Args: { p_itens: string };
        Returns: string;
      };
    };
  };
};
