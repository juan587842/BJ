'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Consignacao, ConsignacaoResumo, Produto, Fornecedor } from '@/types';
import { ArrowLeft, Calendar, Package, DollarSign, TrendingUp, RotateCw, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import ConsignacaoModal from '@/components/admin/ConsignacaoModal';

interface ConsigDetalhe extends Consignacao {
  produto?: Produto;
  fornecedor?: Fornecedor;
}

function diasRestantes(dataFim: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const fim = new Date(dataFim + 'T00:00:00');
  return Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
}

export default function ComissionadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [c, setC] = useState<ConsigDetalhe | null>(null);
  const [resumo, setResumo] = useState<ConsignacaoResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRenew, setShowRenew] = useState(false);
  const [acting, setActing] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from('consignacoes')
      .select('*, produto:produtos!consignacoes_produto_id_fkey(*), fornecedor:fornecedores!consignacoes_fornecedor_id_fkey(*)')
      .eq('id', params.id).single();
    setC(data as ConsigDetalhe);
    const { data: r } = await (supabase as any).rpc('consignacao_resumo', { p_consignacao_id: params.id });
    setResumo(r?.[0] || null);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [params.id]);

  const encerrarOuDevolver = async (novoStatus: 'encerrada' | 'devolvida') => {
    if (!c) return;
    const msg = novoStatus === 'devolvida'
      ? `Marcar como devolvida? Estoque restante (${(c.quantidade_recebida - (resumo?.quantidade_vendida || 0))}) será zerado.`
      : 'Encerrar essa consignação? Produto deixará de aparecer no catálogo.';
    if (!confirm(msg)) return;
    setActing(true);

    await (supabase as any).from('consignacoes').update({ status: novoStatus }).eq('id', c.id);

    if (novoStatus === 'devolvida') {
      const restantes = c.quantidade_recebida - (resumo?.quantidade_vendida || 0);
      const novaQtd = Math.max((c.produto?.quantidade || 0) - restantes, 0);
      await (supabase as any).from('produtos').update({ quantidade: novaQtd }).eq('id', c.produto_id);
    }

    setActing(false);
    fetch();
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando...</div>;
  if (!c) return <div className="p-12 text-center text-slate-400">Consignação não encontrada</div>;

  const dias = diasRestantes(c.data_fim);
  const expirado = dias < 0;
  const vendidas = resumo?.quantidade_vendida || 0;
  const aDevolver = resumo?.quantidade_a_devolver || 0;
  const comissao = Number(resumo?.comissao_total || 0);
  const devido = Number(resumo?.valor_devido_fornecedor || 0);
  const receita = Number(resumo?.receita_bruta || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/comissionados" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{c.produto?.nome}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fornecedor: {c.fornecedor?.nome}</p>
        </div>
        <StatusBadge variant={c.status === 'ativa' ? (expirado ? 'danger' : 'success') : 'neutral'}>
          {c.status === 'ativa' ? (expirado ? 'Expirado' : `${dias} dias restantes`) : c.status}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-1">
          <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center mb-4">
            {c.produto?.imagem_url ? (
              <img src={c.produto.imagem_url} alt={c.produto.nome} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Preço venda</span><span className="font-semibold text-slate-900 dark:text-slate-100">R$ {Number(c.produto?.preco || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Preço fornecedor</span><span className="font-semibold text-slate-900 dark:text-slate-100">R$ {Number(c.preco_fornecedor).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Comissão</span><span className="font-semibold text-slate-900 dark:text-slate-100">{Number(c.comissao_percentual).toFixed(2)}%</span></div>
            <div className="flex items-center gap-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
              <Calendar className="w-3 h-3" />
              {new Date(c.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(c.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')}
            </div>
            {c.observacoes && <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">{c.observacoes}</p>}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resumo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Stat icon={Package} label="Recebidas" value={String(c.quantidade_recebida)} />
            <Stat icon={CheckCircle} label="Vendidas" value={String(vendidas)} accent="text-emerald-600 dark:text-emerald-400" />
            <Stat icon={RotateCw} label="A devolver" value={String(aDevolver)} accent="text-amber-600 dark:text-amber-400" />
            <Stat icon={DollarSign} label="Receita bruta" value={`R$ ${receita.toFixed(2)}`} />
            <Stat icon={TrendingUp} label="Comissão (banca)" value={`R$ ${comissao.toFixed(2)}`} accent="text-emerald-600 dark:text-emerald-400" />
            <Stat icon={DollarSign} label="Devido fornecedor" value={`R$ ${devido.toFixed(2)}`} accent="text-rose-600 dark:text-rose-400" />
          </div>

          {expirado && c.status === 'ativa' && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">Período encerrado. Produto não aparece mais no catálogo. Marque como devolvida ou renove.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            {c.status === 'ativa' && (
              <>
                <button onClick={() => setShowRenew(true)} className="btn-primary"><RotateCw className="w-4 h-4" /> Nova remessa</button>
                <button onClick={() => encerrarOuDevolver('devolvida')} disabled={acting} className="btn-secondary">Marcar devolvida</button>
                <button onClick={() => encerrarOuDevolver('encerrada')} disabled={acting} className="btn-secondary">Encerrar</button>
              </>
            )}
          </div>
        </div>
      </div>

      {showRenew && c.produto && (
        <ConsignacaoModal
          produtoExistente={c.produto}
          onSave={() => { setShowRenew(false); fetch(); router.refresh(); }}
          onClose={() => setShowRenew(false)}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className={`text-lg font-semibold ${accent || 'text-slate-900 dark:text-slate-100'}`}>{value}</p>
    </div>
  );
}
