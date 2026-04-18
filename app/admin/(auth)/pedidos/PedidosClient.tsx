'use client';

import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  MessageCircle,
  Package,
  ChevronDown,
  Loader2,
  AlertCircle,
  CreditCard,
  Store,
} from 'lucide-react';
import type { Pedido, PedidoItem, PedidoStatus } from '@/types';
import { confirmarPedido, cancelarPedido, marcarComoPago, concluirPedido } from './actions';

type PedidoComItens = Pedido & { itens: PedidoItem[] };

interface Props {
  pedidos: PedidoComItens[];
}

const STATUS_LABELS: Record<PedidoStatus, { label: string; classe: string; icon: any }> = {
  pendente: {
    label: 'Pendente',
    classe: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
    icon: Clock,
  },
  pago: {
    label: 'Pago',
    classe: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
    icon: CreditCard,
  },
  confirmado: {
    label: 'Confirmado',
    classe: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20',
    icon: CheckCircle2,
  },
  concluido: {
    label: 'Concluído',
    classe: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
    icon: CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    classe: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
    icon: XCircle,
  },
};

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtWhatsApp(wa: string) {
  const digits = wa.replace(/\D/g, '');
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return wa;
}

function linkWhatsApp(wa: string, pedidoNumero: number) {
  const digits = wa.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Olá! Sobre seu pedido #${String(pedidoNumero).padStart(4, '0')} na Banca do Jonas...`
  );
  return `https://wa.me/${digits}?text=${msg}`;
}

export default function PedidosClient({ pedidos }: Props) {
  const [filtro, setFiltro] = useState<PedidoStatus | 'todos'>('todos');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    if (filtro === 'todos') return pedidos;
    return pedidos.filter((p) => p.status === filtro);
  }, [pedidos, filtro]);

  const contadores = useMemo(() => {
    const base = { todos: pedidos.length, pendente: 0, pago: 0, confirmado: 0, concluido: 0, cancelado: 0 };
    for (const p of pedidos) base[p.status]++;
    return base;
  }, [pedidos]);

  const handleAction = async (
    fn: () => Promise<{ success: boolean; error?: string }>,
    pedidoId: string
  ) => {
    setProcessando(pedidoId);
    setErro(null);
    try {
      const r = await fn();
      if (!r.success) setErro(r.error || 'Erro ao processar.');
    } finally {
      setProcessando(null);
    }
  };

  const filtros: Array<{ v: PedidoStatus | 'todos'; label: string; count: number }> = [
    { v: 'todos', label: 'Todos', count: contadores.todos },
    { v: 'pendente', label: 'Pendentes', count: contadores.pendente },
    { v: 'pago', label: 'Pagos', count: contadores.pago },
    { v: 'confirmado', label: 'Confirmados', count: contadores.confirmado },
    { v: 'concluido', label: 'Concluídos', count: contadores.concluido },
    { v: 'cancelado', label: 'Cancelados', count: contadores.cancelado },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Pedidos Online
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralize e gerencie todos os pedidos feitos no site público.
          </p>
        </div>
      </div>

      {/* Erro global */}
      {erro && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{erro}</span>
          <button
            onClick={() => setErro(null)}
            className="ml-auto text-red-700 dark:text-red-400 hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filtros.map((f) => {
          const ativo = filtro === f.v;
          return (
            <button
              key={f.v}
              onClick={() => setFiltro(f.v)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                ativo
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                  ativo
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 py-16 text-center">
          <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Nenhum pedido por aqui
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Os pedidos feitos no site vão aparecer nesta lista.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p) => {
            const cfg = STATUS_LABELS[p.status];
            const StatusIcon = cfg.icon;
            const aberto = expandido === p.id;
            const isProcessing = processando === p.id;

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Linha principal */}
                <button
                  onClick={() => setExpandido(aberto ? null : p.id)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {p.tipo_pagamento === 'online' ? (
                        <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <Store className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        #{String(p.numero).padStart(4, '0')}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${cfg.classe}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {p.tipo_pagamento === 'online' ? 'Online' : 'Retirada no local'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                      {p.cliente_nome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {fmtData(p.created_at)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {fmtBRL(p.total_centavos)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Detalhes expandidos */}
                {aberto && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
                    {/* Dados do cliente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">WhatsApp</p>
                        <a
                          href={linkWhatsApp(p.cliente_whatsapp, p.numero)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {fmtWhatsApp(p.cliente_whatsapp)}
                        </a>
                      </div>
                      {p.cliente_email && (
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">E-mail</p>
                          <p className="text-slate-900 dark:text-slate-100">{p.cliente_email}</p>
                        </div>
                      )}
                      {p.cliente_cpf && (
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">CPF</p>
                          <p className="text-slate-900 dark:text-slate-100 tabular-nums">{p.cliente_cpf}</p>
                        </div>
                      )}
                      {p.observacoes && (
                        <div className="sm:col-span-2">
                          <p className="text-slate-500 dark:text-slate-400 font-medium mb-0.5">Observações</p>
                          <p className="text-slate-900 dark:text-slate-100">{p.observacoes}</p>
                        </div>
                      )}
                    </div>

                    {/* Itens */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Itens do pedido</span>
                      </div>
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {p.itens.map((item) => (
                          <li key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                              {item.quantidade}×
                            </span>
                            <span className="flex-1 text-sm text-slate-900 dark:text-slate-100 truncate">
                              {item.produto_nome}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                              {fmtBRL(item.preco_unitario_centavos)}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums min-w-[70px] text-right">
                              {fmtBRL(item.subtotal_centavos)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {fmtBRL(p.total_centavos)}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap items-center gap-2">
                      {p.status === 'pendente' && p.tipo_pagamento === 'online' && (
                        <button
                          onClick={() => handleAction(() => marcarComoPago(p.id), p.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 disabled:opacity-50 transition-colors"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                          Marcar como pago
                        </button>
                      )}
                      {(p.status === 'pendente' || p.status === 'pago') && (
                        <button
                          onClick={() => handleAction(() => confirmarPedido(p.id), p.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Confirmar e dar baixa no estoque
                        </button>
                      )}
                      {p.status === 'confirmado' && (
                        <button
                          onClick={() => handleAction(() => concluirPedido(p.id), p.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Marcar como concluído
                        </button>
                      )}
                      {(p.status === 'pendente' || p.status === 'pago') && (
                        <button
                          onClick={() => {
                            if (confirm('Cancelar este pedido?')) {
                              handleAction(() => cancelarPedido(p.id), p.id);
                            }
                          }}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                      )}
                      <a
                        href={linkWhatsApp(p.cliente_whatsapp, p.numero)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors ml-auto"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Contatar cliente
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
