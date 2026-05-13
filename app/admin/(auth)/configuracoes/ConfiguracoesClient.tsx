'use client';

import { useState } from 'react';
import { Trophy, Package, Loader2, CheckCircle2, CreditCard, Store, ShoppingBag, TestTube, Zap, Printer, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  atualizarModoCatalogo,
  atualizarConfigPedidos,
  atualizarConfigImpressoes,
  criarTipoImpressao,
  atualizarTipoImpressao,
  deletarTipoImpressao,
} from './actions';
import type { SiteConfig, TipoImpressao } from '@/types';

interface Props {
  config: SiteConfig;
  tiposImpressao: TipoImpressao[];
}

function centavosParaReais(c: number) {
  return (c / 100).toFixed(2).replace('.', ',');
}
function reaisParaCentavos(s: string): number | null {
  const normal = s.replace(/\./g, '').replace(',', '.').trim();
  const n = parseFloat(normal);
  if (!isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function Toggle({ ativo, onChange, disabled }: { ativo: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!ativo)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-40 disabled:cursor-not-allowed ${
        ativo ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          ativo ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function ConfiguracoesClient({ config, tiposImpressao }: Props) {
  // ─ Estado: Modo do Catálogo ────────────────────────────────────────────
  const [modo, setModo] = useState<'copa' | 'catalogo'>(config.modo_catalogo);
  const [salvandoModo, setSalvandoModo] = useState(false);
  const [feedbackModo, setFeedbackModo] = useState<'sucesso' | 'erro' | null>(null);

  // ─ Estado: Pedidos ─────────────────────────────────────────────────────
  const [pedidosOnline, setPedidosOnline] = useState(config.pedidos_online_ativo);
  const [pagamentoOnline, setPagamentoOnline] = useState(config.pagamento_online_ativo);
  const [retirada, setRetirada] = useState(config.retirada_local_ativa);
  const [sumupModo, setSumupModo] = useState<'sandbox' | 'producao'>(config.sumup_modo);
  const [salvandoPedidos, setSalvandoPedidos] = useState(false);
  const [feedbackPedidos, setFeedbackPedidos] = useState<'sucesso' | 'erro' | null>(null);

  const handleSalvarModo = async () => {
    setSalvandoModo(true);
    setFeedbackModo(null);
    const r = await atualizarModoCatalogo(modo);
    setSalvandoModo(false);
    setFeedbackModo(r.success ? 'sucesso' : 'erro');
    if (r.success) setTimeout(() => setFeedbackModo(null), 3000);
  };

  const handleSalvarPedidos = async () => {
    setSalvandoPedidos(true);
    setFeedbackPedidos(null);
    const r = await atualizarConfigPedidos({
      pedidos_online_ativo: pedidosOnline,
      pagamento_online_ativo: pagamentoOnline,
      retirada_local_ativa: retirada,
      sumup_modo: sumupModo,
    });
    setSalvandoPedidos(false);
    setFeedbackPedidos(r.success ? 'sucesso' : 'erro');
    if (r.success) setTimeout(() => setFeedbackPedidos(null), 3000);
  };

  // ─ Estado: Impressões ──────────────────────────────────────────────────
  const [impressoesAtiva, setImpressoesAtiva] = useState(config.impressoes_ativa ?? false);
  const [precoPb, setPrecoPb] = useState(centavosParaReais(config.impressao_preco_pb_centavos ?? 50));
  const [precoColorida, setPrecoColorida] = useState(centavosParaReais(config.impressao_preco_colorida_centavos ?? 150));
  const [salvandoImpressoes, setSalvandoImpressoes] = useState(false);
  const [feedbackImpressoes, setFeedbackImpressoes] = useState<'sucesso' | 'erro' | null>(null);
  const [erroImpressoes, setErroImpressoes] = useState<string | null>(null);

  // ─ Estado: CRUD tipos ──────────────────────────────────────────────────
  const [tipoModal, setTipoModal] = useState<{ id?: string; nome: string; icone: string; ordem: number; ativo: boolean } | null>(null);
  const [salvandoTipo, setSalvandoTipo] = useState(false);
  const [erroTipo, setErroTipo] = useState<string | null>(null);

  const handleSalvarImpressoes = async () => {
    setErroImpressoes(null);
    const pb = reaisParaCentavos(precoPb);
    const co = reaisParaCentavos(precoColorida);
    if (pb === null || co === null) {
      setErroImpressoes('Preços inválidos.');
      return;
    }
    setSalvandoImpressoes(true);
    setFeedbackImpressoes(null);
    const r = await atualizarConfigImpressoes({
      impressoes_ativa: impressoesAtiva,
      impressao_preco_pb_centavos: pb,
      impressao_preco_colorida_centavos: co,
    });
    setSalvandoImpressoes(false);
    setFeedbackImpressoes(r.success ? 'sucesso' : 'erro');
    if (!r.success) setErroImpressoes(r.error || 'Erro.');
    if (r.success) setTimeout(() => setFeedbackImpressoes(null), 3000);
  };

  const handleSalvarTipo = async () => {
    if (!tipoModal) return;
    setErroTipo(null);
    setSalvandoTipo(true);
    const payload = {
      nome: tipoModal.nome,
      icone: tipoModal.icone || null,
      ordem: tipoModal.ordem,
      ativo: tipoModal.ativo,
    };
    const r = tipoModal.id
      ? await atualizarTipoImpressao(tipoModal.id, payload)
      : await criarTipoImpressao(payload);
    setSalvandoTipo(false);
    if (r.success) {
      setTipoModal(null);
    } else {
      setErroTipo(r.error || 'Erro.');
    }
  };

  const handleDeletarTipo = async (id: string) => {
    if (!confirm('Deletar este tipo? Pedidos antigos mantêm o nome registrado.')) return;
    await deletarTipoImpressao(id);
  };

  const modoMudou = modo !== config.modo_catalogo;
  const pedidosMudou =
    pedidosOnline !== config.pedidos_online_ativo ||
    pagamentoOnline !== config.pagamento_online_ativo ||
    retirada !== config.retirada_local_ativa ||
    sumupModo !== config.sumup_modo;

  const opcoes = [
    {
      value: 'copa' as const,
      icon: Trophy,
      titulo: 'Modo Copa',
      descricao: 'Landing page temática Copa do Mundo 2026 com hero, countdown, produtos Copa e catálogo.',
    },
    {
      value: 'catalogo' as const,
      icon: Package,
      titulo: 'Modo Catálogo',
      descricao: 'Grade de produtos com busca e filtros. Ideal para catálogo geral da loja.',
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Controle como o site público funciona e como os pedidos online são processados.
        </p>
      </div>

      {/* ═══════════ MODO DO CATÁLOGO ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Modo do Catálogo Público
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Como a página principal aparece para os visitantes.
          </p>
        </div>

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
                    ativo ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <p
                  className={`text-sm font-semibold mb-1 ${
                    ativo ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'
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

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSalvarModo}
            disabled={salvandoModo || !modoMudou}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {salvandoModo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alteração'
            )}
          </button>
          {feedbackModo === 'sucesso' && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Salvo!
            </div>
          )}
          {feedbackModo === 'erro' && (
            <p className="text-red-500 text-sm">Erro ao salvar.</p>
          )}
        </div>
      </div>

      {/* ═══════════ PEDIDOS ONLINE ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pedidos Online</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle quais formas de pedido estão disponíveis para os clientes.
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Habilitar pedidos online
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quando desligado, o botão de pedidos no site é ocultado — os clientes só conseguem reservar via WhatsApp.
              </p>
            </div>
            <Toggle ativo={pedidosOnline} onChange={setPedidosOnline} />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pagamento online (SumUp)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permite que o cliente pague diretamente no site. Requer credenciais SumUp configuradas no .env.
              </p>
            </div>
            <Toggle ativo={pagamentoOnline} onChange={setPagamentoOnline} disabled={!pedidosOnline} />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Retirada no local (pagar na loja)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cliente faz o pedido online e paga no balcão quando retirar.
              </p>
            </div>
            <Toggle ativo={retirada} onChange={setRetirada} disabled={!pedidosOnline} />
          </div>
        </div>

        {/* SumUp mode */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ambiente do SumUp
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Use <strong>Sandbox</strong> para testes (cobranças simuladas). Só alterne para produção quando as credenciais reais estiverem configuradas.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: 'sandbox' as const, label: 'Sandbox', desc: 'Testes', icon: TestTube },
              { v: 'producao' as const, label: 'Produção', desc: 'Cobranças reais', icon: Zap },
            ].map((opt) => {
              const Icon = opt.icon;
              const ativo = sumupModo === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => setSumupModo(opt.v)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    ativo
                      ? opt.v === 'producao'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                        : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      ativo
                        ? opt.v === 'producao'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        ativo
                          ? opt.v === 'producao'
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSalvarPedidos}
            disabled={salvandoPedidos || !pedidosMudou}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {salvandoPedidos ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações de Pedidos'
            )}
          </button>
          {feedbackPedidos === 'sucesso' && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Salvo!
            </div>
          )}
          {feedbackPedidos === 'erro' && (
            <p className="text-red-500 text-sm">Erro ao salvar.</p>
          )}
        </div>
      </div>

      {/* ═══════════ IMPRESSÕES (XEROX) ═══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Serviço de Impressão / Xerox</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Habilite a página pública /impressoes e defina os valores por folha.
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Habilitar serviço de impressão
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clientes poderão enviar arquivos pela rota /impressoes.
            </p>
          </div>
          <Toggle ativo={impressoesAtiva} onChange={setImpressoesAtiva} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preço por folha — preto e branco (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={precoPb}
              onChange={(e) => setPrecoPb(e.target.value)}
              disabled={!impressoesAtiva}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 tabular-nums disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preço por folha — colorida (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={precoColorida}
              onChange={(e) => setPrecoColorida(e.target.value)}
              disabled={!impressoesAtiva}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 tabular-nums disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSalvarImpressoes}
            disabled={salvandoImpressoes}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {salvandoImpressoes ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Impressões'
            )}
          </button>
          {feedbackImpressoes === 'sucesso' && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Salvo!
            </div>
          )}
          {erroImpressoes && <p className="text-red-500 text-sm">{erroImpressoes}</p>}
        </div>

        {/* Tipos de impressão */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tipos de impressão
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Categorias mostradas ao cliente (boleto, fatura, documento, foto etc).
              </p>
            </div>
            <button
              onClick={() => setTipoModal({ nome: '', icone: '', ordem: tiposImpressao.length, ativo: true })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>

          {tiposImpressao.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Nenhum tipo cadastrado.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {tiposImpressao.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="text-base">{t.icone || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.nome}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Ordem: {t.ordem} · {t.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setTipoModal({
                        id: t.id,
                        nome: t.nome,
                        icone: t.icone ?? '',
                        ordem: t.ordem,
                        ativo: t.ativo,
                      })
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletarTipo(t.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal CRUD Tipo */}
      {tipoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {tipoModal.id ? 'Editar tipo' : 'Novo tipo'}
              </h3>
              <button onClick={() => setTipoModal(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={tipoModal.nome}
                  onChange={(e) => setTipoModal({ ...tipoModal, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ícone (emoji)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={tipoModal.icone}
                    onChange={(e) => setTipoModal({ ...tipoModal, icone: e.target.value })}
                    placeholder="📄"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={tipoModal.ordem}
                    onChange={(e) => setTipoModal({ ...tipoModal, ordem: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm tabular-nums"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={tipoModal.ativo}
                  onChange={(e) => setTipoModal({ ...tipoModal, ativo: e.target.checked })}
                />
                Ativo (visível no site)
              </label>
            </div>

            {erroTipo && <p className="text-xs text-red-500">{erroTipo}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setTipoModal(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarTipo}
                disabled={salvandoTipo || !tipoModal.nome.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {salvandoTipo ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
