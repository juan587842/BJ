'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Store,
  Minus,
  Plus,
  ShoppingBag,
  CreditCard,
  MessageCircle,
  Printer,
} from 'lucide-react';
import ProductGrid from '@/components/shared/ProductGrid';
import ProductDetailModal from '@/components/shared/ProductDetailModal';
import CheckoutModal from '@/components/shared/CheckoutModal';
import { WHATSAPP } from '@/lib/constants';

interface Produto {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  imagem_url: string | null;
  categoria_id: string | null;
  categoria?: { nome: string; icone: string | null } | undefined;
}

interface Categoria {
  id: string;
  nome: string;
  icone: string | null;
}

interface PedidosConfig {
  pedidos_online_ativo: boolean;
  pagamento_online_ativo: boolean;
  retirada_local_ativa: boolean;
}

interface Props {
  produtos: Produto[];
  categorias: Categoria[];
  pedidosConfig?: PedidosConfig;
  impressoesAtiva?: boolean;
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function QtySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div className="flex items-center" onClick={stop}>
      <button
        onClick={(e) => {
          stop(e);
          onChange(Math.max(0, value - 1));
        }}
        className="w-8 h-8 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-l-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 active:bg-indigo-100 transition-colors"
        aria-label="Diminuir"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="w-9 h-8 flex items-center justify-center text-slate-900 dark:text-slate-100 text-sm font-semibold border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 tabular-nums select-none">
        {value}
      </div>
      <button
        onClick={(e) => {
          stop(e);
          onChange(value + 1);
        }}
        className="w-8 h-8 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-r-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 active:bg-indigo-100 transition-colors"
        aria-label="Aumentar"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ProductCardWithQty({
  produto,
  qty,
  onQtyChange,
  onOpenDetail,
}: {
  produto: Produto;
  qty: number;
  onQtyChange: (v: number) => void;
  onOpenDetail: () => void;
}) {
  return (
    <div
      onClick={onOpenDetail}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col"
    >
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-3xl text-slate-300 dark:text-slate-600">📦</span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[2rem]">
          {produto.nome}
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
          R$ {fmt(produto.preco)}
        </p>
        <div className="mt-2.5">
          <QtySelector value={qty} onChange={onQtyChange} />
        </div>
      </div>
    </div>
  );
}

export default function CatalogoOriginal({ produtos, categorias, pedidosConfig, impressoesAtiva }: Props) {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const pedidosOnlineAtivo = pedidosConfig?.pedidos_online_ativo ?? false;
  const pagamentoOnlineAtivo = pedidosConfig?.pagamento_online_ativo ?? false;
  const retiradaLocalAtiva = pedidosConfig?.retirada_local_ativa ?? false;
  const canCheckout =
    pedidosOnlineAtivo && (pagamentoOnlineAtivo || retiradaLocalAtiva);

  const setQty = useCallback((id: string, v: number) => {
    setQtys((prev) => ({ ...prev, [id]: v }));
  }, []);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca = busca
        ? p.nome.toLowerCase().includes(busca.toLowerCase())
        : true;
      const matchCat = categoriaAtiva ? p.categoria_id === categoriaAtiva : true;
      return matchBusca && matchCat;
    });
  }, [produtos, busca, categoriaAtiva]);

  const cartItems = produtos.filter((p) => (qtys[p.id] || 0) > 0);
  const total = cartItems.reduce((sum, p) => sum + p.preco * (qtys[p.id] || 0), 0);

  const handleWhatsApp = () => {
    const lines = ['🛒 *Pedido — Banca do Jonas*', ''];
    cartItems.forEach((p) => {
      lines.push(`▪ ${p.nome} × ${qtys[p.id]} — R$ ${fmt(p.preco * qtys[p.id])}`);
    });
    lines.push('');
    lines.push(`*Total: R$ ${fmt(total)}*`);
    lines.push('');
    lines.push('Gostaria de confirmar meu pedido!');
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Banca do Jonas
              </span>
            </div>
            <a
              href="/impressoes"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Printer className="w-4 h-4" />
              Impressões
            </a>
          </div>
        </div>
      </header>

      {/* Busca + filtros */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {categorias.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setCategoriaAtiva('')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !categoriaAtiva
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaAtiva(cat.id === categoriaAtiva ? '' : cat.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    categoriaAtiva === cat.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.icone && <span className="mr-1">{cat.icone}</span>}
                  {cat.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {produtosFiltrados.length} produto
              {produtosFiltrados.length !== 1 ? 's' : ''}
            </p>
            {pedidosOnlineAtivo ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {produtosFiltrados.map((p) => (
                  <ProductCardWithQty
                    key={p.id}
                    produto={p}
                    qty={qtys[p.id] || 0}
                    onQtyChange={(v) => setQty(p.id, v)}
                    onOpenDetail={() => setSelectedProductId(p.id)}
                  />
                ))}
              </div>
            ) : (
              <ProductGrid produtos={produtosFiltrados} />
            )}
          </>
        )}
      </main>

      {/* Detail modal (somente quando modo pedidos ativo, pois ProductGrid já tem o seu) */}
      {pedidosOnlineAtivo && (
        <ProductDetailModal
          produtoId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          cartQty={selectedProductId ? qtys[selectedProductId] || 0 : 0}
          onCartQtyChange={(v) => {
            if (selectedProductId) setQty(selectedProductId, v);
          }}
        />
      )}

      {/* WhatsApp flutuante */}
      {pedidosOnlineAtivo && (
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed left-4 z-40 flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-lg shadow-black/20 hover:bg-[#20c15e] transition-all duration-300 ${
            cartItems.length > 0 ? 'bottom-20 sm:bottom-5' : 'bottom-5'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      )}

      {/* Carrinho flutuante */}
      {pedidosOnlineAtivo && (
        <div
          className={`fixed bottom-5 right-4 z-50 transition-all duration-300 ${
            cartItems.length > 0
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {cartOpen ? (
            <div className="w-[19rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    Seu Carrinho
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} · R${' '}
                    {fmt(total)}
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="p-3 space-y-2">
                {canCheckout && (
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                    className="w-full flex items-center gap-3 bg-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    {pagamentoOnlineAtivo && retiradaLocalAtiva ? (
                      <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                    ) : pagamentoOnlineAtivo ? (
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Store className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="text-left flex-1">
                      <div className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-75 leading-none">
                        Fazer pedido online
                      </div>
                      <div className="text-[13px] font-bold leading-snug mt-0.5">
                        {pagamentoOnlineAtivo && retiradaLocalAtiva
                          ? 'Pagar online ou retirar'
                          : pagamentoOnlineAtivo
                          ? 'Pagar online agora'
                          : 'Retirar e pagar no local'}
                      </div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleWhatsApp();
                    setCartOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 font-bold text-sm px-4 py-3 rounded-xl transition-colors ${
                    canCheckout
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                      : 'bg-[#25D366] text-white hover:bg-[#20c15e]'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-75 leading-none">
                      Enviar via WhatsApp
                    </div>
                    <div className="text-[13px] font-bold leading-snug mt-0.5">
                      Confirmar pedido por mensagem
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!canCheckout) {
                  handleWhatsApp();
                } else {
                  setCartOpen(true);
                }
              }}
              className="flex items-center gap-3 bg-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-xl shadow-xl shadow-indigo-600/25 hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-75 leading-none">
                  {canCheckout ? 'Finalizar pedido' : 'Enviar via WhatsApp'}
                </div>
                <div className="text-[17px] font-bold leading-snug tabular-nums">
                  R$ {fmt(total)}
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Checkout */}
      {pedidosOnlineAtivo && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          itens={cartItems.map((p) => ({
            produto_id: p.id,
            nome: p.nome,
            preco: p.preco,
            quantidade: qtys[p.id] || 0,
          }))}
          total={total}
          pagamentoOnlineAtivo={pagamentoOnlineAtivo}
          retiradaLocalAtiva={retiradaLocalAtiva}
          whatsapp={WHATSAPP}
          onSuccess={() => setQtys({})}
        />
      )}
    </div>
  );
}
