'use client';

import { useMemo, useState } from 'react';
import {
  Printer,
  Clock,
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  MessageCircle,
  Store,
  AlertCircle,
  Palette,
  FileText,
  ChevronDown,
} from 'lucide-react';
import type { Impressao, ImpressaoStatus, TipoImpressao } from '@/types';
import {
  marcarImpressaoPaga,
  iniciarProducaoImpressao,
  concluirImpressao,
  cancelarImpressao,
  obterUrlArquivoImpressao,
} from './actions';

interface Props {
  impressoes: Impressao[];
  tipos: TipoImpressao[];
}

const STATUS_LABELS: Record<ImpressaoStatus, { label: string; classe: string; icon: any }> = {
  pendente: { label: 'Pendente', classe: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20', icon: Clock },
  pago: { label: 'Pago', classe: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20', icon: CreditCard },
  em_producao: { label: 'Em produção', classe: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20', icon: Printer },
  concluido: { label: 'Concluído', classe: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', classe: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20', icon: XCircle },
};

function fmtBRL(c: number) {
  return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function fmtWa(wa: string) {
  const d = wa.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return wa;
}
function linkWa(wa: string, numero: number) {
  const d = wa.replace(/\D/g, '');
  const msg = encodeURIComponent(`Olá! Sobre sua impressão #${String(numero).padStart(4, '0')}...`);
  return `https://wa.me/${d}?text=${msg}`;
}

export default function ImpressoesClient({ impressoes, tipos }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<ImpressaoStatus | 'todos' | 'ativos'>('ativos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    return impressoes.filter((i) => {
      if (filtroStatus === 'todos') {
        // pass
      } else if (filtroStatus === 'ativos') {
        if (i.status === 'concluido' || i.status === 'cancelado') return false;
      } else if (i.status !== filtroStatus) {
        return false;
      }
      if (filtroTipo !== 'todos' && i.tipo_impressao_id !== filtroTipo) return false;
      return true;
    });
  }, [impressoes, filtroStatus, filtroTipo]);

  const agrupadas = useMemo(() => {
    const map = new Map<string, { nome: string; icone: string | null; itens: Impressao[] }>();
    for (const imp of filtradas) {
      const key = imp.tipo_impressao_id ?? '__sem__';
      const meta = tipos.find((t) => t.id === imp.tipo_impressao_id);
      if (!map.has(key)) {
        map.set(key, {
          nome: meta?.nome || imp.tipo_impressao_nome,
          icone: meta?.icone ?? null,
          itens: [],
        });
      }
      map.get(key)!.itens.push(imp);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  }, [filtradas, tipos]);

  const contadores = useMemo(() => {
    const base: Record<string, number> = { todos: impressoes.length, ativos: 0, pendente: 0, pago: 0, em_producao: 0, concluido: 0, cancelado: 0 };
    for (const i of impressoes) {
      base[i.status]++;
      if (i.status !== 'concluido' && i.status !== 'cancelado') base.ativos++;
    }
    return base;
  }, [impressoes]);

  const handleAction = async (fn: () => Promise<{ success: boolean; error?: string }>, id: string) => {
    setProcessando(id);
    setErro(null);
    try {
      const r = await fn();
      if (!r.success) setErro(r.error || 'Erro.');
    } finally {
      setProcessando(null);
    }
  };

  const handleBaixar = async (id: string) => {
    setProcessando(id);
    setErro(null);
    try {
      const r = await obterUrlArquivoImpressao(id);
      if (!r.success) {
        setErro(r.error || 'Erro ao obter arquivo.');
      } else {
        window.open(r.url, '_blank');
      }
    } finally {
      setProcessando(null);
    }
  };

  const filtrosStatus: Array<{ v: ImpressaoStatus | 'todos' | 'ativos'; label: string; count: number }> = [
    { v: 'ativos', label: 'Fila ativa', count: contadores.ativos },
    { v: 'pendente', label: 'Pendentes', count: contadores.pendente },
    { v: 'pago', label: 'Pagos', count: contadores.pago },
    { v: 'em_producao', label: 'Em produção', count: contadores.em_producao },
    { v: 'concluido', label: 'Concluídos', count: contadores.concluido },
    { v: 'cancelado', label: 'Cancelados', count: contadores.cancelado },
    { v: 'todos', label: 'Todos', count: contadores.todos },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Impressões</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fila de impressões agrupada por tipo, em ordem de chegada.
        </p>
      </div>

      {erro && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{erro}</span>
          <button onClick={() => setErro(null)} className="ml-auto hover:opacity-70">✕</button>
        </div>
      )}

      {/* Filtros status */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filtrosStatus.map((f) => {
          const ativo = filtroStatus === f.v;
          return (
            <button
              key={f.v}
              onClick={() => setFiltroStatus(f.v)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                ativo ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {f.label}
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                ativo ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtro tipo */}
      {tipos.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tipo:</span>
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`text-xs px-3 py-1 rounded-full ${filtroTipo === 'todos' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Todos
          </button>
          {tipos.map((t) => (
            <button
              key={t.id}
              onClick={() => setFiltroTipo(t.id)}
              className={`text-xs px-3 py-1 rounded-full ${filtroTipo === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              {t.icone ? `${t.icone} ` : ''}{t.nome}
            </button>
          ))}
        </div>
      )}

      {/* Lista agrupada */}
      {agrupadas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 py-16 text-center">
          <Printer className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Nenhuma impressão na fila.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {agrupadas.map((grupo) => (
            <section key={grupo.key}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{grupo.icone || '📄'}</span>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {grupo.nome}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  {grupo.itens.length}
                </span>
              </div>

              <div className="space-y-2">
                {grupo.itens.map((imp, idx) => {
                  const cfg = STATUS_LABELS[imp.status];
                  const SI = cfg.icon;
                  const aberto = expandido === imp.id;
                  const isProcessing = processando === imp.id;
                  return (
                    <div key={imp.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <button
                        onClick={() => setExpandido(aberto ? null : imp.id)}
                        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              #{String(imp.numero).padStart(4, '0')}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${cfg.classe}`}>
                              <SI className="w-3 h-3" />
                              {cfg.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              <Palette className="w-3 h-3" />
                              {imp.modo_cor === 'pb' ? 'PB' : 'Colorida'}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                              {imp.quantidade_folhas} folha{imp.quantidade_folhas > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 dark:text-slate-100 mt-0.5 truncate">{imp.cliente_nome}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fmtData(imp.created_at)}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{fmtBRL(imp.total_centavos)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {imp.tipo_pagamento === 'online' ? 'Online' : 'Retirada'}
                          </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                      </button>

                      {aberto && (
                        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">WhatsApp</p>
                              <a
                                href={linkWa(imp.cliente_whatsapp, imp.numero)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                {fmtWa(imp.cliente_whatsapp)}
                              </a>
                            </div>
                            {imp.cliente_email && (
                              <div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">E-mail</p>
                                <p className="text-slate-900 dark:text-slate-100">{imp.cliente_email}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">Arquivo</p>
                              <p className="text-slate-900 dark:text-slate-100 truncate">{imp.arquivo_nome ?? imp.arquivo_path}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">Preço/folha</p>
                              <p className="text-slate-900 dark:text-slate-100 tabular-nums">{fmtBRL(imp.preco_unitario_centavos)}</p>
                            </div>
                            {imp.observacoes && (
                              <div className="sm:col-span-2">
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">Observações</p>
                                <p className="text-slate-900 dark:text-slate-100">{imp.observacoes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleBaixar(imp.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                              Baixar arquivo
                            </button>

                            {imp.status === 'pendente' && imp.tipo_pagamento === 'online' && (
                              <button
                                onClick={() => handleAction(() => marcarImpressaoPaga(imp.id), imp.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 disabled:opacity-50"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Marcar pago
                              </button>
                            )}

                            {(imp.status === 'pendente' || imp.status === 'pago') && (
                              <button
                                onClick={() => handleAction(() => iniciarProducaoImpressao(imp.id), imp.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Iniciar produção
                              </button>
                            )}

                            {imp.status !== 'concluido' && imp.status !== 'cancelado' && (
                              <button
                                onClick={() => handleAction(() => concluirImpressao(imp.id), imp.id)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Concluir
                              </button>
                            )}

                            {imp.status !== 'concluido' && imp.status !== 'cancelado' && (
                              <button
                                onClick={() => {
                                  if (confirm('Cancelar esta impressão?')) handleAction(() => cancelarImpressao(imp.id), imp.id);
                                }}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancelar
                              </button>
                            )}

                            <a
                              href={linkWa(imp.cliente_whatsapp, imp.numero)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 ml-auto"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Contatar
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
