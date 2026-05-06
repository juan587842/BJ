'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Consignacao } from '@/types';
import { Plus, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import ConsignacaoModal from '@/components/admin/ConsignacaoModal';

interface ConsignacaoCard extends Omit<Consignacao, 'produto' | 'fornecedor'> {
  produto?: { id: string; nome: string; imagem_url: string | null; preco: number; quantidade: number };
  fornecedor?: { id: string; nome: string };
  resumo?: { quantidade_vendida: number; comissao_total: number };
}

function diasRestantes(dataFim: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const fim = new Date(dataFim + 'T00:00:00');
  return Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
}

export default function ComissionadosPage() {
  const supabase = createClient();
  const [consignacoes, setConsignacoes] = useState<ConsignacaoCard[]>([]);
  const [filter, setFilter] = useState<'ativa' | 'todas'>('ativa');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      let query = supabase.from('consignacoes')
        .select('*, produto:produtos!consignacoes_produto_id_fkey(id,nome,imagem_url,preco,quantidade), fornecedor:fornecedores!consignacoes_fornecedor_id_fkey(id,nome)') as any;
      if (filter === 'ativa') query = query.eq('status', 'ativa');
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) { setFetchError(error.message); return; }
      const list = (data as ConsignacaoCard[]) || [];

      const enriched = await Promise.all(list.map(async (c) => {
        const { data: r } = await (supabase as any).rpc('consignacao_resumo', { p_consignacao_id: c.id });
        return { ...c, resumo: r?.[0] } as ConsignacaoCard;
      }));
      setConsignacoes(enriched);
    } catch (e: any) {
      setFetchError(e?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Comissionados</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{consignacoes.length} consignação{consignacoes.length !== 1 ? 'ões' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Comissionado
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-2">
          <button onClick={() => setFilter('ativa')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'ativa' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Ativas</button>
          <button onClick={() => setFilter('todas')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'todas' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>Todas</button>
        </div>
      </div>

      {fetchError && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-400">
          Erro: {fetchError}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Carregando...</div>
        ) : consignacoes.length === 0 ? (
          <EmptyState icon="package" title="Nenhuma consignação" description="Cadastre produtos comissionados para começar."
            action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Criar primeiro</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            {consignacoes.map(c => {
              const dias = diasRestantes(c.data_fim);
              const expirado = dias < 0;
              const vendidas = c.resumo?.quantidade_vendida || 0;
              const restantes = c.quantidade_recebida - vendidas;
              const comissao = Number(c.resumo?.comissao_total || 0);
              return (
                <Link key={c.id} href={`/admin/comissionados/${c.id}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center">
                    {c.produto?.imagem_url ? (
                      <img src={c.produto.imagem_url} alt={c.produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge variant={c.status === 'ativa' ? (expirado ? 'danger' : 'success') : 'neutral'}>
                        {c.status === 'ativa' ? (expirado ? 'Expirado' : `${dias}d`) : c.status}
                      </StatusBadge>
                    </div>
                    {expirado && c.status === 'ativa' && (
                      <div className="absolute top-3 left-3"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{c.produto?.nome}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.fornecedor?.nome}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(c.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Vendidas</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{vendidas}/{c.quantidade_recebida}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Restam</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{restantes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Comissão</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">R$ {comissao.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <ConsignacaoModal
          onSave={() => { setShowModal(false); fetchData(); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
