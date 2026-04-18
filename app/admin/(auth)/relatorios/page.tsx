import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, startOfDay, endOfDay, parseISO, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingCart, DollarSign, Package, TrendingUp, Calendar, Clock, Award, ArrowUpRight } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import SalesLineChart from '@/components/admin/SalesLineChart';

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; data?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const params = await searchParams;
  const periodo = params.periodo || '7dias';
  const dataReferenciaStr = params.data || '2026-04-06';
  
  // Use local time for the reference date to avoid timezone shift issues
  const [ano, mes, dia] = dataReferenciaStr.split('-').map(Number);
  const dataRef = new Date(ano, mes - 1, dia);

  let inicio: Date;
  let fim: Date;
  let labelPeriodo = '';

  if (periodo === '7dias') {
    inicio = startOfDay(subDays(dataRef, 6));
    fim = endOfDay(dataRef);
    labelPeriodo = 'Últimos 7 dias a partir de ' + format(dataRef, 'dd/MM/yyyy');
  } else if (periodo === 'mes') {
    inicio = startOfMonth(dataRef);
    fim = endOfMonth(dataRef);
    labelPeriodo = format(dataRef, "MMMM 'de' yyyy", { locale: ptBR });
  } else if (periodo === 'ano') {
    inicio = startOfYear(dataRef);
    fim = endOfYear(dataRef);
    labelPeriodo = format(dataRef, "'Ano de' yyyy", { locale: ptBR });
  } else {
    // dia específico
    inicio = startOfDay(dataRef);
    fim = endOfDay(dataRef);
    labelPeriodo = format(dataRef, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  const inicioDia = inicio.toISOString();
  const fimDia = fim.toISOString();

  const [vendasResult, itensResult] = await Promise.all([
    supabase
      .from('vendas')
      .select('*, forma_pagamento:formas_pagamento(nome, icone)')
      .gte('created_at', inicioDia)
      .lte('created_at', fimDia)
      .order('created_at', { ascending: true }),
    supabase
      .from('venda_itens')
      .select(`
        quantidade,
        preco_unitario,
        produto:produtos(nome),
        vendas!inner(created_at)
      `)
      .gte('vendas.created_at', inicioDia)
      .lte('vendas.created_at', fimDia)
      .order('quantidade', { ascending: false }),
  ]);

  const vendas = vendasResult.data;
  const itensVendidos = itensResult.data;

  const vendasTyped = (vendas as any[]) || [];
  const totalVendas = vendasTyped.reduce((acc, v) => acc + Number(v.total), 0);
  const totalItens = vendasTyped.reduce((acc, v) => acc + v.itens_count, 0);

  let chartData: { label: string; valor: number; quantidade: number; mesRaw?: number; dataRaw?: number }[] = [];
  let contextoPico = { label: 'Pico', valor: '—', detail: '' };

  if (periodo === 'ano') {
    const meses = eachMonthOfInterval({ start: inicio, end: fim });
    chartData = meses.map(mes => ({
      label: format(mes, 'MMM', { locale: ptBR }),
      mesRaw: mes.getMonth(),
      valor: 0,
      quantidade: 0,
    }));
    vendasTyped.forEach(v => {
      const dataVenda = new Date(v.created_at);
      const m = dataVenda.getMonth();
      const node = chartData.find(d => d.mesRaw === m);
      if (node) {
        node.valor += Number(v.total);
        node.quantidade += v.itens_count;
      }
    });
    let picoIndex = 0;
    chartData.forEach((d, i) => { if (d.valor > chartData[picoIndex].valor) picoIndex = i; });
    if (chartData[picoIndex].valor > 0) {
      contextoPico = { label: 'Mês de Pico', valor: chartData[picoIndex].label, detail: `R$ ${chartData[picoIndex].valor.toFixed(2)}` };
    }
  } else if (periodo === 'mes' || periodo === '7dias') {
    const dias = eachDayOfInterval({ start: inicio, end: fim });
    chartData = dias.map(dia => ({
      label: format(dia, 'dd/MM'),
      dataRaw: startOfDay(dia).getTime(),
      valor: 0,
      quantidade: 0,
    }));
    vendasTyped.forEach(v => {
      // Use parseISO to strictly interpret the date if it's UTC
      const dataVenda = parseISO(v.created_at);
      const db = startOfDay(dataVenda).getTime();
      const node = chartData.find(d => d.dataRaw === db);
      if (node) {
        node.valor += Number(v.total);
        node.quantidade += v.itens_count;
      }
    });
    let picoIndex = 0;
    chartData.forEach((d, i) => { if (d.valor > chartData[picoIndex].valor) picoIndex = i; });
    if (chartData[picoIndex].valor > 0) {
      contextoPico = { label: 'Dia de Pico', valor: chartData[picoIndex].label, detail: `R$ ${chartData[picoIndex].valor.toFixed(2)}` };
    }
  } else {
    // dia especifico
    const horas: Record<number, { label: string; valor: number; quantidade: number }> = {};
    for (let h = 0; h < 24; h++) {
      horas[h] = { label: `${String(h).padStart(2, '0')}:00`, valor: 0, quantidade: 0 };
    }
    vendasTyped.forEach((v: any) => {
      const hora = parseISO(v.created_at).getHours();
      horas[hora].valor += Number(v.total);
      horas[hora].quantidade += v.itens_count;
    });
    chartData = Object.values(horas);
    let picoIndex = 0;
    chartData.forEach((d, i) => { if (d.valor > chartData[picoIndex].valor) picoIndex = i; });
    if (chartData[picoIndex].valor > 0) {
      contextoPico = { label: 'Hora de Pico', valor: chartData[picoIndex].label, detail: `R$ ${chartData[picoIndex].valor.toFixed(2)}` };
    }
  }

  // Maior venda
  const maiorVenda = vendasTyped.length > 0
    ? vendasTyped.reduce((max: any, v: any) => Number(v.total) > Number(max.total) ? v : max, vendasTyped[0])
    : null;

  // Produtos mais vendidos
  const produtosMaisVendidos: Record<string, { nome: string; qtd: number; total: number }> = {};
  (itensVendidos as any[])?.forEach((item: any) => {
    const nome = item.produto?.nome || 'Produto removido';
    if (!produtosMaisVendidos[nome]) {
      produtosMaisVendidos[nome] = { nome, qtd: 0, total: 0 };
    }
    produtosMaisVendidos[nome].qtd += item.quantidade;
    produtosMaisVendidos[nome].total += Number(item.preco_unitario) * item.quantidade;
  });
  const topProdutos = Object.values(produtosMaisVendidos)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  const stats = [
    { label: 'Total de Vendas', value: String(vendasTyped.length), icon: ShoppingCart, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Faturamento', value: `R$ ${totalVendas.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Itens Vendidos', value: String(totalItens), icon: Package, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Média por Venda', value: vendasTyped.length > 0 ? `R$ ${(totalVendas / vendasTyped.length).toFixed(2)}` : '—', icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  const contextStats = [
    {
      label: contextoPico.label,
      value: contextoPico.valor,
      detail: contextoPico.detail || 'Sem vendas',
      icon: Clock,
    },
    {
      label: 'Maior Venda',
      value: maiorVenda ? `R$ ${Number(maiorVenda.total).toFixed(2)}` : '—',
      detail: maiorVenda ? `${maiorVenda.itens_count} ${maiorVenda.itens_count === 1 ? 'item' : 'itens'}` : 'Sem vendas',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Relatório de Vendas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {labelPeriodo}
          </p>
        </div>
        <form className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
          
          <input
            type="date"
            name="data"
            defaultValue={dataReferenciaStr}
            className="input-field py-2 text-sm w-full sm:w-auto"
          />
          <select
            name="periodo"
            defaultValue={periodo}
            className="input-field py-2 bg-white dark:bg-slate-900 text-sm flex-1 sm:flex-none"
          >
            <option value="dia">Apenas este dia</option>
            <option value="7dias">7 dias (até esta data)</option>
            <option value="mes">Mês (desta data)</option>
            <option value="ano">Ano (desta data)</option>
          </select>
          <button type="submit" className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
            Filtrar
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-2">{stat.value}</p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contextStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Faturamento no Período</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolução de vendas ({labelPeriodo})</p>
          </div>
        </div>
        {vendasTyped.length > 0 ? (
          <SalesLineChart data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-[260px] text-sm text-slate-400 dark:text-slate-500">
            Sem dados de venda para gerar o gráfico.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {topProdutos.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mais Vendidos do Período</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProdutos.map((p, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const pct = totalVendas > 0 ? ((p.total / totalVendas) * 100).toFixed(1) : '0';
              return (
                <div key={p.nome} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{i < 3 ? medals[i] : <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{i + 1}</span>}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.nome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{pct}% do faturamento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.qtd} un.</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">R$ {p.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* Sales List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vendas Recentes</h2>
            {vendasTyped.length > 0 && (
              <span className="badge badge-neutral ml-auto">{vendasTyped.length}</span>
            )}
          </div>
          {vendasTyped.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {[...vendasTyped].reverse().map((venda: any) => (
                <div key={venda.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {format(new Date(venda.created_at), 'dd/MM', { locale: ptBR })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {format(new Date(venda.created_at), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {venda.itens_count} {venda.itens_count === 1 ? 'item' : 'itens'}
                      </p>
                      {venda.forma_pagamento ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {venda.forma_pagamento.icone} {venda.forma_pagamento.nome}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500">Pagamento não informado</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    R$ {Number(venda.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="package"
              title="Nenhuma venda no período"
              description="Selecione outro filtro para visualizar."
            />
          )}
        </div>
      </div>
    </div>
  );
}
