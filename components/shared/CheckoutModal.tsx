'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle2, CreditCard, Store, AlertCircle, MessageCircle } from 'lucide-react';
import { criarPedidoPublico, type CheckoutItemInput } from '@/app/actions/checkout';

interface Props {
  open: boolean;
  onClose: () => void;
  itens: Array<{
    produto_id: string;
    nome: string;
    preco: number;
    quantidade: number;
  }>;
  total: number;
  pagamentoOnlineAtivo: boolean;
  retiradaLocalAtiva: boolean;
  whatsapp: string;
  onSuccess: () => void;
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWhatsAppInput(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpfInput(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

type Step = 'form' | 'sucesso';

export default function CheckoutModal({
  open,
  onClose,
  itens,
  total,
  pagamentoOnlineAtivo,
  retiradaLocalAtiva,
  whatsapp,
  onSuccess,
}: Props) {
  const [nome, setNome] = useState('');
  const [wa, setWa] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState<'online' | 'retirada_local' | null>(
    retiradaLocalAtiva ? 'retirada_local' : pagamentoOnlineAtivo ? 'online' : null
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('form');
  const [pedidoNumero, setPedidoNumero] = useState<number | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  if (!open) return null;

  const podeEnviar =
    nome.trim().length >= 3 &&
    wa.replace(/\D/g, '').length >= 10 &&
    tipoPagamento !== null &&
    itens.length > 0 &&
    !enviando;

  const handleSubmit = async () => {
    if (!podeEnviar || !tipoPagamento) return;
    setEnviando(true);
    setErro(null);

    const itensInput: CheckoutItemInput[] = itens.map((i) => ({
      produto_id: i.produto_id,
      quantidade: i.quantidade,
    }));

    const r = await criarPedidoPublico({
      cliente: {
        nome: nome.trim(),
        whatsapp: wa.replace(/\D/g, ''),
        email: email.trim() || undefined,
        cpf: cpf.replace(/\D/g, '') || undefined,
      },
      tipo_pagamento: tipoPagamento,
      itens: itensInput,
      observacoes: observacoes.trim() || undefined,
    });

    setEnviando(false);

    if (!r.success) {
      setErro(r.error || 'Erro ao criar pedido.');
      return;
    }

    setPedidoNumero(r.pedido_numero ?? null);
    setCheckoutUrl(r.checkout_url ?? null);
    setStep('sucesso');

    // Notifica dono da banca via WhatsApp (abre em nova janela)
    const msg = encodeURIComponent(
      `🛒 *Novo pedido online — Banca do Jonas*\n\n` +
        `*Pedido:* #${String(r.pedido_numero).padStart(4, '0')}\n` +
        `*Cliente:* ${nome.trim()}\n` +
        `*WhatsApp:* ${wa}\n` +
        `*Pagamento:* ${tipoPagamento === 'online' ? 'Online (SumUp)' : 'Retirada no local'}\n` +
        `*Total:* R$ ${fmt(total)}\n\n` +
        `Itens:\n${itens.map((i) => `• ${i.nome} × ${i.quantidade}`).join('\n')}`
    );
    // abre aba de notificação ao lojista
    setTimeout(() => {
      window.open(`https://wa.me/${whatsapp}?text=${msg}`, '_blank');
    }, 300);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg bg-[#0A0A0A] border border-[#D4AF37]/25 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#D4AF37]">
              {step === 'form' ? 'Pedido Online' : 'Pedido Criado'}
            </p>
            <h2 className="text-base font-black text-white font-montserrat mt-0.5">
              {step === 'form' ? 'Finalizar compra' : 'Obrigado!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 'form' ? (
            <div className="p-5 space-y-5">
              {/* Resumo */}
              <div className="bg-[#060606] border border-[#1e1e1e] rounded-xl p-3">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
                  Resumo
                </p>
                <ul className="space-y-1.5 mb-2">
                  {itens.map((i) => (
                    <li key={i.produto_id} className="flex items-center justify-between text-sm text-white/80">
                      <span className="truncate pr-2">
                        {i.quantidade}× {i.nome}
                      </span>
                      <span className="tabular-nums font-semibold text-white flex-shrink-0">
                        R$ {fmt(i.preco * i.quantidade)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-2 border-t border-[#1e1e1e]">
                  <span className="text-xs font-bold tracking-wider uppercase text-white/50">Total</span>
                  <span className="text-lg font-black gold-text tabular-nums">R$ {fmt(total)}</span>
                </div>
              </div>

              {/* Forma de pagamento */}
              {(pagamentoOnlineAtivo || retiradaLocalAtiva) && (
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-2">
                    Como você quer pagar?
                  </p>
                  <div className="space-y-2">
                    {pagamentoOnlineAtivo && (
                      <button
                        onClick={() => setTipoPagamento('online')}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          tipoPagamento === 'online'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                            : 'border-[#252525] hover:border-[#3a3a3a]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Pagar online agora</p>
                          <p className="text-xs text-white/50 mt-0.5">
                            Cartão via SumUp — pedido confirmado na hora.
                          </p>
                        </div>
                      </button>
                    )}
                    {retiradaLocalAtiva && (
                      <button
                        onClick={() => setTipoPagamento('retirada_local')}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          tipoPagamento === 'retirada_local'
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                            : 'border-[#252525] hover:border-[#3a3a3a]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Retirar e pagar no local</p>
                          <p className="text-xs text-white/50 mt-0.5">
                            Reserva os itens — pagamento feito na banca ao retirar.
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dados do cliente */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                  Seus dados
                </p>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome completo *"
                  className="w-full px-3.5 py-2.5 bg-[#060606] border border-[#252525] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
                <input
                  type="tel"
                  value={wa}
                  onChange={(e) => setWa(formatWhatsAppInput(e.target.value))}
                  placeholder="WhatsApp * — (11) 91234-5678"
                  className="w-full px-3.5 py-2.5 bg-[#060606] border border-[#252525] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail (opcional)"
                  className="w-full px-3.5 py-2.5 bg-[#060606] border border-[#252525] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpfInput(e.target.value))}
                  placeholder="CPF na nota (opcional)"
                  className="w-full px-3.5 py-2.5 bg-[#060606] border border-[#252525] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                />
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações (opcional)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[#060606] border border-[#252525] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 transition-colors resize-none"
                />
              </div>

              {erro && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37] mb-1">
                  Pedido #{String(pedidoNumero ?? 0).padStart(4, '0')}
                </p>
                <h3 className="text-lg font-black text-white font-montserrat">
                  Recebemos seu pedido!
                </h3>
                <p className="text-sm text-white/60 mt-2">
                  {tipoPagamento === 'online' && checkoutUrl
                    ? 'Clique abaixo para concluir o pagamento no SumUp.'
                    : tipoPagamento === 'online'
                    ? 'O pagamento online ficará disponível em breve — a banca entrará em contato pelo WhatsApp.'
                    : 'Aguarde o contato pelo WhatsApp para combinar a retirada.'}
                </p>
              </div>

              {tipoPagamento === 'online' && checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#D4AF37] text-black font-black text-sm tracking-wide uppercase py-3.5 rounded-xl hover:bg-[#E8C44A] transition-colors"
                >
                  Pagar R$ {fmt(total)}
                </a>
              )}

              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Olá! Acabei de fazer o pedido #${String(pedidoNumero ?? 0).padStart(4, '0')} no site.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white text-sm font-bold py-3 rounded-xl hover:bg-[#20c15e] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Falar no WhatsApp
              </a>

              <button
                onClick={onClose}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'form' && (
          <div className="px-5 py-4 border-t border-[#1a1a1a] bg-[#060606]">
            <button
              onClick={handleSubmit}
              disabled={!podeEnviar}
              className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-black text-sm tracking-wide uppercase py-3.5 rounded-xl hover:bg-[#E8C44A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Confirmar pedido — R$ {fmt(total)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
