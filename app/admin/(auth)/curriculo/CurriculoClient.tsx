'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, RotateCcw, Loader2 } from 'lucide-react';
import CurriculoForm from '@/components/curriculo/CurriculoForm';
import CurriculoPreview from '@/components/curriculo/CurriculoPreview';
import { CURRICULO_VAZIO, type Curriculo, type TemplateId } from '@/types/curriculo';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFViewer),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Carregando preview…</div> }
);

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <button disabled className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm opacity-50"><Loader2 className="w-4 h-4 animate-spin" />Carregando…</button> }
);

const TEMPLATES: { id: TemplateId; label: string; descricao: string }[] = [
  { id: 'classico', label: 'Clássico', descricao: 'Serif tradicional' },
  { id: 'moderno', label: 'Moderno', descricao: 'Sidebar colorida' },
  { id: 'minimalista', label: 'Minimalista', descricao: 'Limpo e direto' },
];

export default function CurriculoClient() {
  const [curriculo, setCurriculo] = useState<Curriculo>(CURRICULO_VAZIO);
  const [template, setTemplate] = useState<TemplateId>('classico');
  const [aba, setAba] = useState<'form' | 'preview'>('form');

  const documento = useMemo(() => <CurriculoPreview curriculo={curriculo} template={template} />, [curriculo, template]);

  const filename = useMemo(() => {
    const base = curriculo.dados.nome.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `curriculo-${base || 'sem-nome'}.pdf`;
  }, [curriculo.dados.nome]);

  const limpar = () => {
    if (confirm('Limpar todos os campos do formulário?')) setCurriculo(CURRICULO_VAZIO);
  };

  return (
    <div className="space-y-4">
      {/* Header + ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Currículo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Preencha os dados, escolha um modelo e baixe em PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={limpar}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar
          </button>
          <PDFDownloadLink document={documento} fileName={filename}>
            {({ loading }: { loading: boolean }) => (
              <span className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? 'Gerando…' : 'Baixar PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Seletor de templates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Modelo</div>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => {
            const ativo = template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                  ativo
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <div>{t.label}</div>
                <div className={`text-[10px] mt-0.5 ${ativo ? 'text-indigo-100' : 'text-slate-400'}`}>{t.descricao}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abas mobile */}
      <div className="lg:hidden flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setAba('form')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${aba === 'form' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
        >
          Formulário
        </button>
        <button
          onClick={() => setAba('preview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${aba === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
        >
          Preview
        </button>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${aba === 'form' ? 'block' : 'hidden'} lg:block`}>
          <CurriculoForm curriculo={curriculo} setCurriculo={setCurriculo} />
        </div>
        <div className={`${aba === 'preview' ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-[80vh]">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              {documento}
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
