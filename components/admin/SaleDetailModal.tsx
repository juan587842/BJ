'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { X, Package } from 'lucide-react';

interface SaleDetailModalProps {
  vendaId: string;
}

export default function SaleDetailModal({ vendaId }: SaleDetailModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from('venda_itens')
        .select('*, produto:produtos(nome, codigo_barras)')
        .eq('venda_id', vendaId);
      if (data) setItems(data as any[]);
      setLoading(false);
    };
    fetchItems();
  }, [vendaId]);

  const handleClose = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('venda');
    router.replace(url.pathname + url.search);
  };

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.preco_unitario) * item.quantidade,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Detalhes da Venda</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">Nenhum item encontrado</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.produto?.nome || 'Produto removido'}
                    </p>
                    {item.produto?.codigo_barras && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{item.produto.codigo_barras}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.quantidade} x R$ {Number(item.preco_unitario).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 ml-4">
                    R$ {(Number(item.preco_unitario) * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">R$ {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
