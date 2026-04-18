'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem, Produto } from '@/types';
import {
  Trash2, Plus, Minus, CheckCircle2, ScanLine, Search,
  Pencil, X, Percent, DollarSign
} from 'lucide-react';

interface FormaPagamento {
  id: string;
  nome: string;
  icone: string;
}

const formasPagamento: FormaPagamento[] = [
  { id: '', nome: 'Não informado', icone: '💰' },
  { id: 'dinheiro', nome: 'Dinheiro', icone: '💵' },
  { id: 'pix', nome: 'PIX', icone: '📱' },
  { id: 'credito', nome: 'Cartão de Crédito', icone: '💳' },
  { id: 'debito', nome: 'Cartão de Débito', icone: '💳' },
  { id: 'vale', nome: 'Vale Alimentação', icone: '🎫' },
];

interface CartItemExtended extends CartItem {
  precoOriginal: number;
  desconto: number;
  descontoTipo: 'percent' | 'fixed';
}

export default function CaixaPage() {
  const supabase = createClient();
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState<CartItemExtended[]>([]);
  const [searchResults, setSearchResults] = useState<Produto[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForma, setSelectedForma] = useState('');
  const [descontoGlobal, setDescontoGlobal] = useState(0);
  const [descontoGlobalTipo, setDescontoGlobalTipo] = useState<'percent' | 'fixed'>('fixed');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDesconto, setEditDesconto] = useState('');
  const [editDescontoTipo, setEditDescontoTipo] = useState<'percent' | 'fixed'>('fixed');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addToCart = useCallback((produto: Produto) => {
    setCart(prev => {
      const existing = prev.find(item => item.produto_id === produto.id);
      if (existing) {
        return prev.map(item =>
          item.produto_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, {
        produto_id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        precoOriginal: Number(produto.preco),
        quantidade: 1,
        imagem_url: produto.imagem_url,
        desconto: 0,
        descontoTipo: 'fixed',
      }];
    });
    setSearchResults([]);
    setShowSearch(false);
    setBarcode('');
    inputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('codigo_barras', barcode.trim())
      .single();

    if (error || !data) {
      setShowSearch(true);
      const { data: results } = await supabase
        .from('produtos')
        .select('*')
        .ilike('nome', `%${barcode}%`)
        .limit(5);
      if (results) setSearchResults(results);
      setBarcode('');
      return;
    }

    addToCart(data);
  };

  const handleSearch = (value: string) => {
    setBarcode(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      if (value.length >= 2) {
        const { data } = await supabase
          .from('produtos')
          .select('*')
          .ilike('nome', `%${value}%`)
          .limit(5);
        if (data) setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    }, 300);
  };

  const updateQuantity = (produtoId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.produto_id === produtoId
            ? { ...item, quantidade: item.quantidade + delta }
            : item
        )
        .filter(item => item.quantidade > 0)
    );
  };

  const removeFromCart = (produtoId: string) => {
    setCart(prev => prev.filter(item => item.produto_id !== produtoId));
  };

  const getItemPrice = (item: CartItemExtended) => {
    if (item.desconto > 0) {
      if (item.descontoTipo === 'percent') {
        return item.precoOriginal * (1 - item.desconto / 100);
      }
      return Math.max(item.precoOriginal - item.desconto, 0);
    }
    return item.precoOriginal;
  };

  const subtotal = cart.reduce((acc, item) => acc + getItemPrice(item) * item.quantidade, 0);
  const descontoValor = descontoGlobalTipo === 'percent'
    ? subtotal * (descontoGlobal / 100)
    : descontoGlobal;
  const total = Math.max(subtotal - descontoValor, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const startCheckout = () => {
    if (cart.length === 0) return;
    setDescontoGlobal(0);
    setDescontoGlobalTipo('fixed');
    setSelectedForma('');
    setShowPaymentModal(true);
  };

  const handleCheckout = async () => {
    setProcessing(true);
    setCheckoutError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setCheckoutError('Sessão expirada. Faça login novamente.');
      setProcessing(false);
      return;
    }

    const items = cart.map(item => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: getItemPrice(item),
    }));

    const { data, error } = await (supabase as any).rpc('finalizar_venda', {
      p_itens: items,
      p_forma_pagamento_id: selectedForma || null,
      p_desconto: descontoValor,
    });

    setProcessing(false);

    if (error) {
      console.error('Erro ao finalizar venda:', error);
      setCheckoutError(error.message || 'Erro ao finalizar a venda');
      return;
    }

    setShowPaymentModal(false);
    setCart([]);
    setDescontoGlobal(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    inputRef.current?.focus();
  };

  const startEditDiscount = (item: CartItemExtended) => {
    setEditingItemId(item.produto_id);
    setEditDesconto(item.desconto > 0 ? String(item.desconto) : '');
    setEditDescontoTipo(item.descontoTipo);
  };

  const applyItemDiscount = (produtoId: string) => {
    const desconto = parseFloat(editDesconto) || 0;
    setCart(prev =>
      prev.map(item =>
        item.produto_id === produtoId
          ? { ...item, desconto, descontoTipo: editDescontoTipo }
          : item
      )
    );
    setEditingItemId(null);
    setEditDesconto('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F2') {
      e.preventDefault();
      if (showPaymentModal) {
        handleCheckout();
      } else {
        startCheckout();
      }
    }
    if (e.key === 'Escape') {
      if (showPaymentModal) {
        setShowPaymentModal(false);
      } else if (editingItemId) {
        setEditingItemId(null);
      } else {
        setShowSearch(false);
        setSearchResults([]);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Venda finalizada!</span>
        </div>
      )}

      {checkoutError && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl shadow-lg">
          <span className="text-sm font-medium">{checkoutError}</span>
          <button onClick={() => setCheckoutError('')} className="ml-2 p-0.5 hover:bg-red-700 rounded">✕</button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
        <form onSubmit={handleBarcodeSubmit} className="relative">
          <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Leia o código de barras ou digite o nome do produto..."
            className="input-field pl-10 text-base"
            autoComplete="off"
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
              {searchResults.map(produto => (
                <button
                  key={produto.id}
                  type="button"
                  onClick={() => addToCart(produto)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-b-0 flex justify-between items-center"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{produto.nome}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    R$ {Number(produto.preco).toFixed(2)} · Estoque: {produto.quantidade}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">F2</kbd> finalizar · <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">Esc</kbd> fechar
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <Search className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhum item no carrinho</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Bipe um produto para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => {
                const isEditing = editingItemId === item.produto_id;
                const itemPrice = getItemPrice(item);
                const hasDiscount = item.desconto > 0;

                return (
                  <div key={item.produto_id} className="card p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount && (
                            <>
                              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                                R$ {item.precoOriginal.toFixed(2)}
                              </span>
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                R$ {itemPrice.toFixed(2)}
                              </span>
                              <span className="badge badge-success">
                                {item.descontoTipo === 'percent' ? `-${item.desconto}%` : `-R$${item.desconto.toFixed(2)}`}
                              </span>
                            </>
                          )}
                          {!hasDiscount && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">R$ {item.precoOriginal.toFixed(2)} un.</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEditDiscount(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Aplicar desconto"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateQuantity(item.produto_id, -1)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">{item.quantidade}</span>
                        <button
                          onClick={() => updateQuantity(item.produto_id, 1)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.produto_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 ml-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setEditDescontoTipo('percent')}
                              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                editDescontoTipo === 'percent'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditDescontoTipo('fixed')}
                              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                editDescontoTipo === 'fixed'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              R$
                            </button>
                          </div>
                          <div className="flex gap-1">
                            {[10, 20, 50].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setEditDesconto(String(pct))}
                                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                -{pct}%
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            value={editDesconto}
                            onChange={(e) => setEditDesconto(e.target.value)}
                            placeholder={editDescontoTipo === 'percent' ? '10' : '5.00'}
                            className="input-field w-24 py-1.5 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') applyItemDiscount(item.produto_id);
                              if (e.key === 'Escape') setEditingItemId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => applyItemDiscount(item.produto_id)}
                            className="btn-primary py-1.5 px-3 text-xs"
                          >
                            Aplicar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Subtotal: <span className="font-semibold text-slate-900 dark:text-slate-100">R$ {(itemPrice * item.quantidade).toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 p-4 lg:w-80">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Itens</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{itemCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">R$ {subtotal.toFixed(2)}</span>
            </div>
            {descontoGlobal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Desconto</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">-R$ {descontoValor.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={startCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full btn-success text-base py-3"
          >
            {processing ? 'Processando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Finalizar Venda</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {formasPagamento.map(fp => (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => setSelectedForma(fp.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all ${
                        selectedForma === fp.id
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg">{fp.icone}</span>
                      <span className="truncate w-full text-center">{fp.nome}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Desconto na Venda</label>
                <div className="flex gap-2">
                  <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setDescontoGlobalTipo('fixed')}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${
                        descontoGlobalTipo === 'fixed'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescontoGlobalTipo('percent')}
                      className={`px-3 py-2 text-xs font-medium transition-colors ${
                        descontoGlobalTipo === 'percent'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      %
                    </button>
                  </div>
                  <div className="relative flex-1">
                    {descontoGlobalTipo === 'fixed' ? (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                    <input
                      type="number"
                      value={descontoGlobal || ''}
                      onChange={(e) => setDescontoGlobal(parseFloat(e.target.value) || 0)}
                      placeholder={descontoGlobalTipo === 'percent' ? '10' : '5.00'}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="text-slate-900 dark:text-slate-100">R$ {subtotal.toFixed(2)}</span>
                </div>
                {descontoValor > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Desconto</span>
                    <span className="text-emerald-600 dark:text-emerald-400">-R$ {descontoValor.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-slate-100">Total</span>
                  <span className="text-slate-900 dark:text-slate-100">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full btn-success text-base py-3"
              >
                {processing ? 'Processando...' : 'Confirmar Venda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
