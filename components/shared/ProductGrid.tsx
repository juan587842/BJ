'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductDetailModal from '@/components/shared/ProductDetailModal';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  categoria?: {
    nome: string;
    icone: string | null;
  };
}

interface ProductGridProps {
  produtos: Produto[];
}

export default function ProductGrid({ produtos }: ProductGridProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            onClick={() => setSelectedProductId(produto.id)}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {produto.imagem_url ? (
                <img
                  src={produto.imagem_url}
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-3xl text-slate-300 dark:text-slate-600">📦</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                {produto.nome}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                R$ {Number(produto.preco).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ProductDetailModal
        produtoId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </>
  );
}