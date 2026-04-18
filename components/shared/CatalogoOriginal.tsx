'use client';

import { useState, useMemo } from 'react';
import { Search, Store } from 'lucide-react';
import ProductGrid from '@/components/shared/ProductGrid';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  categoria_id: string | null;
  categoria?: { nome: string; icone: string | null } | null;
}

interface Categoria {
  id: string;
  nome: string;
  icone: string | null;
}

interface Props {
  produtos: Produto[];
  categorias: Categoria[];
}

export default function CatalogoOriginal({ produtos, categorias }: Props) {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('');

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca = busca
        ? p.nome.toLowerCase().includes(busca.toLowerCase())
        : true;
      const matchCat = categoriaAtiva ? p.categoria_id === categoriaAtiva : true;
      return matchBusca && matchCat;
    });
  }, [produtos, busca, categoriaAtiva]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Banca do Jonas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Busca + filtros */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Input de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Chips de categoria */}
          {categorias.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setCategoriaAtiva('')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !categoriaAtiva
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id === categoriaAtiva ? '' : cat.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    categoriaAtiva === cat.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.icone && <span className="mr-1">{cat.icone}</span>}
                  {cat.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid de produtos */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {produtosFiltrados.length} produto
              {produtosFiltrados.length !== 1 ? 's' : ''}
            </p>
            <ProductGrid produtos={produtosFiltrados} />
          </>
        )}
      </main>
    </div>
  );
}
