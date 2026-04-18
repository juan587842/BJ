import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Store, PackageCheck } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: produto } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(nome, icone)')
    .eq('id', id)
    .eq('ativo', true)
    .gt('quantidade', 0)
    .single();

  if (!produto) notFound();

  const p = produto as any;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">Banca do Jonas</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="card overflow-hidden">
          <div className="aspect-video sm:aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-96">
            {p.imagem_url ? (
              <img
                src={p.imagem_url}
                alt={p.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl text-slate-300 dark:text-slate-600">📦</span>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{p.nome}</h1>
                {p.categoria && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {p.categoria.icone && <span className="text-xs">{p.categoria.icone}</span>}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{p.categoria.nome}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                R$ {Number(p.preco).toFixed(2)}
              </p>
            </div>

            {p.descricao && (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.descricao}</p>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Disponível — <span className="font-medium text-slate-900 dark:text-slate-100">{p.quantidade} unidade{p.quantidade !== 1 ? 's' : ''}</span> em estoque
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
