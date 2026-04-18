import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingCart, DollarSign, Package, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import SaleDetailModal from '@/components/admin/SaleDetailModal';

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string; venda?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const params = await searchParams;
  const periodo = params.periodo || '7';
  const vendaId = params.venda || '';

  let inicioStr: string;
  let fimStr: string;

  if (params.inicio && params.fim) {
    inicioStr = startOfDay(new Date(params.inicio)).toISOString();
    fimStr = endOfDay(new Date(params.fim)).toISOString();
  } else {
    const days = parseInt(periodo);
    if (days === 0) {
      inicioStr = startOfDay(new Date()).toISOString();
      fimStr = endOfDay(new Date()).toISOString();
    } else {
      inicioStr = startOfDay(subDays(new Date(), days)).toISOString();
      fimStr = endOfDay(new Date()).toISOString();
    }
  }

  const [{ data: vendas }, { data: stats }] = await Promise.all([
    supabase
      .from('vendas')
      .select('*, forma_pagamento:formas_pagamento(nome, icone)')
      .gte('created_at', inicioStr)
      .lte('created_at', fimStr)
      .order('created_at', { ascending: false }),
    supabase
      .from('vendas')
      .select('total, itens_count')
      .gte('created_at', inicioStr)
      .lte('created_at', fimStr),
  ]);

  const vendasTyped = (vendas as any[]) || [];
  const statsTyped = (stats as any[]) || [];

  const totalVendas = statsTyped.length;
  const faturamento = statsTyped.reduce((acc, v) => acc + Number(v.total), 0);
  const totalItens = statsTyped.reduce((acc, v) => acc + v.itens_count, 0);
  const mediaVenda = totalVendas > 0 ? faturamento / totalVendas : 0;

  const cards = [
    { label: 'Total de Vendas', value: String(totalVendas), icon: ShoppingCart, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Faturamento', value: `R$ ${faturamento.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Itens Vendidos', value: String(totalItens), icon: Package, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Média por Venda', value: `R$ ${mediaVenda.toFixed(2)}`, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  const periodOptions = [
    { value: '0', label: 'Hoje' },
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: 'custom', label: 'Período personalizado' },
  ];

  const periodoLabel = periodo === '0'
    ? 'Vendas de hoje'
    : periodo === 'custom' && params.inicio && params.fim
    ? `${format(new Date(params.inicio), "dd/MM/yyyy")} — ${format(new Date(params.fim), "dd/MM/yyyy")}`
    : `Últimos ${periodo} dias`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Histórico de Vendas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{periodoLabel}</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <select
              name="periodo"
              defaultValue={periodo}
              className="input-field py-2"
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {periodo === 'custom' && (
            <>
              <input
                type="date"
                name="inicio"
                defaultValue={params.inicio}
                className="input-field py-2"
              />
              <input
                type="date"
                name="fim"
                defaultValue={params.fim}
                className="input-field py-2"
              />
            </>
          )}
          <button type="submit" className="btn-primary py-2">
            Filtrar
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.label}</p>
                  <p className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">{card.value}</p>
                </div>
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vendas Registradas</h2>
        </div>
        {vendasTyped.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data/Hora</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pagamento</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Itens</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vendasTyped.map((venda: any) => (
                  <tr key={venda.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {format(new Date(venda.created_at), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {format(new Date(venda.created_at), 'HH:mm:ss', { locale: ptBR })}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {venda.forma_pagamento ? (
                        <span className="badge badge-neutral" title={venda.forma_pagamento.nome}>
                          {venda.forma_pagamento.icone} {venda.forma_pagamento.nome}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="badge badge-neutral">{venda.itens_count} {venda.itens_count === 1 ? 'item' : 'itens'}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                      R$ {Number(venda.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <a
                        href={`?periodo=${periodo}${params.inicio ? `&inicio=${params.inicio}` : ''}${params.fim ? `&fim=${params.fim}` : ''}&venda=${venda.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                      >
                        Ver itens
                        <ChevronDown className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="package"
            title="Nenhuma venda no período"
            description="Tente ajustar o filtro de datas para ver mais vendas."
          />
        )}
      </div>

      {vendaId && <SaleDetailModal vendaId={vendaId} />}
    </div>
  );
}
