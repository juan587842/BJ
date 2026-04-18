'use client';

import { useState } from 'react';
import { Trophy, Package, Loader2, CheckCircle2 } from 'lucide-react';
import { atualizarModoCatalogo } from './actions';

interface Props {
  modoAtual: 'copa' | 'catalogo';
}

export default function ConfiguracoesClient({ modoAtual }: Props) {
  const [modo, setModo] = useState<'copa' | 'catalogo'>(modoAtual);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<'sucesso' | 'erro' | null>(null);

  const handleSalvar = async () => {
    setSalvando(true);
    setFeedback(null);
    const result = await atualizarModoCatalogo(modo);
    setSalvando(false);
    setFeedback(result.success ? 'sucesso' : 'erro');
    if (result.success) {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const opcoes = [
    {
      value: 'copa' as const,
      icon: Trophy,
      titulo: 'Modo Copa',
      descricao: 'Landing page temática Copa do Mundo 2026 com hero, countdown, combos, itens avulsos e carrinho via WhatsApp.',
    },
    {
      value: 'catalogo' as const,
      icon: Package,
      titulo: 'Modo Catálogo',
      descricao: 'Grade de produtos com busca por nome e filtros por categoria. Ideal para catálogo geral da loja.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ajuste como a página pública do catálogo é exibida para os clientes.
        </p>
      </div>

      {/* Card de configuração */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Modo do Catálogo Público
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecione como a página principal será exibida para os visitantes.
          </p>
        </div>

        {/* Radio cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {opcoes.map((opcao) => {
            const Icon = opcao.icon;
            const ativo = modo === opcao.value;
            return (
              <button
                key={opcao.value}
                onClick={() => setModo(opcao.value)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                  ativo
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {ativo && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />
                )}
                <Icon
                  className={`w-6 h-6 mb-3 ${
                    ativo
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <p
                  className={`text-sm font-semibold mb-1 ${
                    ativo
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {opcao.titulo}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {opcao.descricao}
                </p>
              </button>
            );
          })}
        </div>

        {/* Botão salvar + feedback */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSalvar}
            disabled={salvando || modo === modoAtual}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alteração'
            )}
          </button>

          {feedback === 'sucesso' && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Salvo com sucesso!
            </div>
          )}
          {feedback === 'erro' && (
            <p className="text-red-500 text-sm">Erro ao salvar. Tente novamente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
