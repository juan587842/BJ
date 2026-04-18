'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, PackageCheck, Tag, FileText, DollarSign } from 'lucide-react';

interface ProductDetailModalProps {
  produtoId: string | null;
  onClose: () => void;
}

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  quantidade: number;
  imagem_url: string | null;
  codigo_barras: string | null;
  categoria_id: string | null;
  categoria?: {
    nome: string;
    icone: string | null;
  };
}

export default function ProductDetailModal({ produtoId, onClose }: ProductDetailModalProps) {
  const supabase = createClient();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!produtoId) return;

    async function fetchProduto() {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*, categoria:categorias(nome, icone)')
        .eq('id', produtoId)
        .single();

      if (!error && data) {
        setProduto(data as any);
      }
      setLoading(false);
    }

    fetchProduto();
  }, [produtoId]);

  if (!produtoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            Detalhes do Produto
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Carregando...
            </div>
          ) : produto ? (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {produto.imagem_url && (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {produto.nome}
                </h3>
                {produto.categoria && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {produto.categoria.icone && (
                      <span className="text-xs">{produto.categoria.icone}</span>
                    )}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {produto.categoria.nome}
                    </span>
                  </div>
                )}
              </div>

              {produto.descricao && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {produto.descricao}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preço</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      R$ {Number(produto.preco).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <PackageCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Estoque</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {produto.quantidade} un.
                    </p>
                  </div>
                </div>
              </div>

              {produto.codigo_barras && (
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Tag className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Código de Barras
                    </p>
                    <p className="font-mono text-sm text-slate-900 dark:text-slate-100">
                      {produto.codigo_barras}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Produto não encontrado.
            </div>
          )}
        </div>

        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary w-full">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}