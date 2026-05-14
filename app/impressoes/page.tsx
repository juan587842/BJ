import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ImpressaoForm from '@/components/shared/ImpressaoForm';
import type { SiteConfig, TipoImpressao } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ImpressoesPage() {
  const supabase = await createClient();

  const { data: configData } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  const config = (configData as SiteConfig | null) ?? {
    impressoes_ativa: true,
    pagamento_online_ativo: false,
    retirada_local_ativa: true,
    impressao_preco_pb_centavos: 50,
    impressao_preco_colorida_centavos: 150,
    sumup_modo: 'sandbox',
  } as SiteConfig;

  const { data: tiposData } = await supabase
    .from('tipos_impressao')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true });

  let tipos = (tiposData as TipoImpressao[] | null) ?? [];

  if (tipos.length === 0) {
    tipos = [
      { id: 'default-a4', nome: 'A4', icone: '📄', ordem: 0, ativo: true, created_at: '', updated_at: '' },
      { id: 'default-a3', nome: 'A3', icone: '📋', ordem: 1, ativo: true, created_at: '', updated_at: '' },
    ] as TipoImpressao[];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-xl">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Serviço de Impressão
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envie seu documento e retire na banca.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {tipos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Printer className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Nenhum tipo de impressão disponível no momento.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Volte mais tarde ou entre em contato com a banca.
            </p>
          </div>
        ) : (
          <ImpressaoForm config={config} tipos={tipos} />
        )}
      </main>
    </div>
  );
}
