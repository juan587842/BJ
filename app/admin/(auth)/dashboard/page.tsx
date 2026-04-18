import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShoppingCart, DollarSign, Package, AlertTriangle, TrendingUp, CalendarDays, ArrowUpRight, Clock } from 'lucide-react';
import DashboardChart from '@/components/admin/DashboardChart';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const agora = new Date();
  const inicioMes = startOfMonth(agora).toISOString();
  const fimMes = endOfMonth(agora).toISOString();
  const hojeStr = startOfDay(agora).toISOString();

  // Dados do mês
  const [{ data: vendasMes }, { data: estoqueBaixo }, { data: categorias }] = await Promise.all([
    supabase
      .from('vendas')
      .select('*')
      .gte('created_at', inicioMes)
      .lte('created_at', fimMes)
      .order('created_at', { ascending: true }),
    supabase
      .from('produtos')
      .select('id, nome, quantidade, quantidade_minima')
      .order('quantidade', { ascending: true })
      .limit(10),
    supabase
      .from('categorias')
      .select('id, nome')
      .order('nome'),
  ]);

  // Vendas recentes (últimas 5)
  const vendasRecentes = (vendasMes as any[])
    ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || [];

  // Stats do mês
  const totalVendasMes = (vendasMes as any[])?.length || 0;
  const faturamentoMes = (vendasMes as any[])?.reduce((acc: number, v: any) => acc + Number(v.total), 0) || 0;
  const ticketMedio = totalVendasMes > 0 ? faturamentoMes / totalVendasMes : 0;
  const totalItensMes = (vendasMes as any[])?.reduce((acc: number, v: any) => acc + v.itens_count, 0) || 0;

  // Vendas dos últimos 7 dias para o gráfico
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const dia = subDays(agora, i);
    const inicio = startOfDay(dia).toISOString();
    const fim = endOfDay(dia).toISOString();
    const vendasDoDia = (vendasMes as any[])?.filter((v: any) => {
      const d = new Date(v.created_at);
      return d >= new Date(inicio) && d <= new Date(fim);
    }) || [];
    const valor = vendasDoDia.reduce((acc: number, v: any) => acc + Number(v.total), 0);
    chartData.push({
      dia: format(dia, 'EEE', { locale: ptBR }),
      data: format(dia, 'dd/MM'),
      valor,
      quantidade: vendasDoDia.length,
    });
  }

  // Dia com mais vendas
  const diaPico = chartData.reduce((max: any, d: any) => d.valor > max.valor ? d : max, chartData[0] || { dia: '—', valor: 0 });

  // Top 5 produtos do mês
  const { data: itensMes } = await supabase
    .from('venda_itens')
    .select(`quantidade, preco_unitario, produto:produtos(nome), vendas!inner(created_at)`)
    .gte('vendas.created_at', inicioMes)
    .lte('vendas.created_at', fimMes);

  const produtosMaisVendidos: Record<string, { nome: string; qtd: number; total: number }> = {};
  (itensMes as any[])?.forEach((item: any) => {
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

  const estoqueBaixoFiltrado = (estoqueBaixo as any[])?.filter(
    (p: any) => p.quantidade <= p.quantidade_minima
  ) || [];

  const stats = [
    { label: 'Vendas no Mês', value: String(totalVendasMes), icon: ShoppingCart, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Faturamento', value: `R$ ${faturamentoMes.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Ticket Médio', value: `R$ ${ticketMedio.toFixed(2)}`, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Dia de Pico', value: diaPico.dia !== '—' ? diaPico.data : '—', detail: diaPico.dia !== '—' ? `R$ ${diaPico.valor.toFixed(2)}` : 'Sem dados', icon: CalendarDays, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Resumo de {format(agora, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
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
                  {'detail' in stat && stat.detail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.detail}</p>
                  )}
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
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
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Faturamento — Últimos 7 Dias</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolução diária do faturamento</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total 7 dias</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              R$ {chartData.reduce((acc: number, d: any) => acc + d.valor, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <DashboardChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {topProdutos.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Produtos do Mês</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProdutos.map((p, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const pct = faturamentoMes > 0 ? ((p.total / faturamentoMes) * 100).toFixed(1) : '0';
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

        {/* Recent Sales */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vendas Recentes</h2>
            {vendasRecentes.length > 0 && (
              <span className="badge badge-neutral ml-auto">{vendasRecentes.length}</span>
            )}
          </div>
          {vendasRecentes.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {vendasRecentes.map((venda: any) => (
                <div key={venda.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {format(new Date(venda.created_at), 'HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {venda.itens_count} {venda.itens_count === 1 ? 'item' : 'itens'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(venda.created_at), "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    R$ {Number(venda.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm">Nenhuma venda neste mês</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Estoque Baixo</h2>
        </div>
        {estoqueBaixoFiltrado.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {estoqueBaixoFiltrado.slice(0, 8).map((produto: any) => (
              <div key={produto.id} className="px-6 py-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{produto.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mínimo: {produto.quantidade_minima}</p>
                </div>
                <span className="badge badge-danger">{produto.quantidade} un.</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Tudo em ordem</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Todos os produtos com estoque adequado</p>
          </div>
        )}
      </div>
    </div>
  );
}
