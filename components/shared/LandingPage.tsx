'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Minus, Plus, MessageCircle, ChevronDown, Trophy, ShoppingBag, CreditCard, Store } from 'lucide-react';
import CheckoutModal from '@/components/shared/CheckoutModal';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  categoria_id: string | null;
  categoria?: { id: string; nome: string; icone: string | null } | null;
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
}

// ─── Config ───────────────────────────────────────────────────────────────────
// Copa do Mundo 2026 começa em 11/06/2026
const COPA_DATE = new Date('2026-06-11T12:00:00-03:00');
const SINAL_PCT = 0.2;
// Substitua pelo número do WhatsApp da Banca do Jonas (somente dígitos, com DDI)
const WHATSAPP = '5512987076696';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = COPA_DATE.getTime() - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="h-16" />;

  const units: [keyof typeof t, string][] = [
    ['d', 'DIAS'],
    ['h', 'HRS'],
    ['m', 'MIN'],
    ['s', 'SEG'],
  ];

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-4 lg:gap-6">
      {units.map(([k, label], i) => (
        <div key={k} className="flex items-start gap-3 sm:gap-4 lg:gap-6">
          {i > 0 && (
            <div className="text-[#D4AF37] text-2xl sm:text-3xl lg:text-4xl font-thin leading-none mt-1 opacity-40 select-none">
              |
            </div>
          )}
          <div className="text-center min-w-[2.5rem] sm:min-w-[3rem] lg:min-w-[3.5rem]">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tabular-nums leading-none font-montserrat">
              {String(t[k]).padStart(2, '0')}
            </div>
            <div className="text-[9px] font-bold tracking-[0.3em] text-[#D4AF37] mt-2 uppercase">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────
function QtySelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/25 rounded-l-lg hover:bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 transition-colors"
        aria-label="Diminuir"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="w-10 h-9 flex items-center justify-center text-white text-sm font-bold border-y border-[#D4AF37]/25 bg-[#111] tabular-nums select-none">
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/25 rounded-r-lg hover:bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 transition-colors"
        aria-label="Aumentar"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Combo Card (sem imagem, largura total) ───────────────────────────────────
function ComboCard({
  produto,
  qty,
  onQtyChange,
  featured,
  badge,
}: {
  produto: Produto;
  qty: number;
  onQtyChange: (v: number) => void;
  featured?: boolean;
  badge?: string;
}) {
  const sinal = produto.preco * SINAL_PCT;

  return (
    <div
      className={`relative p-4 rounded-xl transition-all ${
        featured
          ? 'border border-[#D4AF37] bg-[#0D0B00]'
          : 'border border-[#252525] bg-[#0A0A0A]'
      }`}
    >
      {featured && badge && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="text-[11px] font-bold bg-[#D4AF37] text-black px-2.5 py-0.5 rounded-full">
            🏆 MAIS VENDIDO
          </span>
          {badge && (
            <span className="text-[11px] font-bold bg-[#2a2a2a] text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-white uppercase tracking-wide leading-snug font-montserrat">
            {produto.nome}
          </h3>
          {produto.descricao && (
            <p className="text-sm text-white/55 mt-1 leading-snug">{produto.descricao}</p>
          )}
          <div className="mt-3">
            <div className="text-2xl font-black gold-text font-montserrat leading-none">
              R$ {fmt(produto.preco)}
            </div>
            <div className="text-xs text-[#D4AF37]/50 mt-1">
              Sinal (20%): R$ {fmt(sinal)}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 self-end">
          <QtySelector value={qty} onChange={onQtyChange} />
        </div>
      </div>
    </div>
  );
}

// ─── Item Card (com imagem, grid 2 colunas) ───────────────────────────────────
function ItemCard({
  produto,
  qty,
  onQtyChange,
}: {
  produto: Produto;
  qty: number;
  onQtyChange: (v: number) => void;
}) {
  const sinal = produto.preco * SINAL_PCT;

  return (
    <div className="border border-[#252525] bg-[#0A0A0A] rounded-xl overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-[#141414] flex items-center justify-center overflow-hidden">
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="w-full h-full object-contain p-3"
          />
        ) : (
          <span className="text-4xl opacity-20">📦</span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-[13px] font-black text-white uppercase tracking-wide leading-snug font-montserrat">
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className="text-[11px] text-white/45 mt-1 leading-snug">{produto.descricao}</p>
        )}
        <div className="mt-auto pt-3">
          <div className="text-[17px] font-black gold-text font-montserrat leading-none">
            R$ {fmt(produto.preco)}
          </div>
          <div className="text-[10px] text-[#D4AF37]/50 mt-0.5">
            Sinal (20%): R$ {fmt(sinal)}
          </div>
          <div className="mt-2.5">
            <QtySelector value={qty} onChange={onQtyChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Os envelopes são originais e lacrados?',
    a: 'Sim! Todos os envelopes e produtos são 100% originais, lacrados de fábrica e adquiridos diretamente de distribuidores autorizados.',
  },
  {
    q: 'Como funciona a pré-reserva?',
    a: 'Você seleciona os produtos desejados, clica em "Finalizar via WhatsApp" e confirma seu pedido. Pagamos apenas o sinal de 20% para garantir a reserva. O restante é pago na retirada.',
  },
  {
    q: 'Minha reserva está garantida por quanto tempo?',
    a: 'Sua reserva fica garantida por 7 dias após a confirmação via WhatsApp. Após esse prazo, o pedido poderá ser cancelado.',
  },
  {
    q: 'Posso cancelar e ser reembolsado?',
    a: 'Cancelamentos com reembolso total podem ser feitos em até 48 horas após a confirmação. Após esse prazo, o sinal não é reembolsado.',
  },
  {
    q: 'O que é o Número da Sorte?',
    a: 'Cada pré-reserva confirmada gera um Número da Sorte exclusivo para participar de sorteios e promoções especiais da Banca do Jonas. Quanto mais itens na reserva, mais chances!',
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-[#252525] rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-4 text-left gap-3"
          >
            <span className="text-sm font-medium text-white/85 leading-snug">{item.q}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#D4AF37] flex-shrink-0 transition-transform duration-200 ${
                open === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {open === i && (
            <div className="px-4 pb-4 border-t border-[#1e1e1e]">
              <p className="text-sm text-white/55 leading-relaxed pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage({ produtos, categorias, pedidosConfig }: Props) {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const pedidosOnlineAtivo = pedidosConfig?.pedidos_online_ativo ?? false;
  const pagamentoOnlineAtivo = pedidosConfig?.pagamento_online_ativo ?? false;
  const retiradaLocalAtiva = pedidosConfig?.retirada_local_ativa ?? false;
  const canCheckout =
    pedidosOnlineAtivo && (pagamentoOnlineAtivo || retiradaLocalAtiva);

  const setQty = useCallback((id: string, v: number) => {
    setQtys((prev) => ({ ...prev, [id]: v }));
  }, []);

  const cartItems = produtos.filter((p) => (qtys[p.id] || 0) > 0);
  const total = cartItems.reduce((sum, p) => sum + p.preco * (qtys[p.id] || 0), 0);
  const sinalTotal = total * SINAL_PCT;

  const handleWhatsApp = () => {
    const lines = ['🛒 *Pré-Reserva — Banca do Jonas*', ''];
    cartItems.forEach((p) => {
      lines.push(`▪ ${p.nome} × ${qtys[p.id]} — R$ ${fmt(p.preco * qtys[p.id])}`);
    });
    lines.push('');
    lines.push(`*Total: R$ ${fmt(total)}*`);
    lines.push(`*Sinal (20%): R$ ${fmt(sinalTotal)}*`);
    lines.push('');
    lines.push('Gostaria de confirmar minha pré-reserva!');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  const scrollToCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Categoria dedicada à Copa 2026 (exibida em seção própria logo abaixo da hero)
  const copaCategoria = categorias.find(
    (c) => c.nome.toLowerCase() === 'copa 2026'
  );
  const copaProdutos = copaCategoria
    ? produtos.filter((p) => p.categoria_id === copaCategoria.id)
    : [];

  // Agrupar produtos por categoria (excluindo a Copa 2026, que tem sua própria seção)
  const semCategoria = produtos.filter((p) => !p.categoria_id);
  const porCategoria = categorias
    .filter((cat) => cat.id !== copaCategoria?.id)
    .map((cat) => ({
      cat,
      items: produtos.filter((p) => p.categoria_id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-black text-white font-montserrat overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-5 sm:px-8 lg:px-12 pb-20 pt-14">
        {/* Background: troféu Copa 2026
            → Substitua pela sua própria imagem em /public/hero-bg.png se desejar */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://bancasanja.online/assets/hero-trophy-bg-D4K_Lwch.png')",
          }}
        />
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/95" />
        {/* Luzes laterais do estádio */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 65% at 0% 50%, rgba(0,90,30,0.38) 0%, transparent 70%), radial-gradient(ellipse 55% 65% at 100% 50%, rgba(0,90,30,0.38) 0%, transparent 70%)',
          }}
        />

        {/* Watermark logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[clamp(4rem,20vw,14rem)] font-black tracking-widest text-white opacity-[0.02] uppercase font-montserrat">
            BANCA DO JONAS
          </span>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 w-full max-w-xs sm:max-w-md lg:max-w-xl mx-auto text-center flex flex-col items-center gap-5 lg:gap-6">
          {/* Marca */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#D4AF37]" />
              <span className="text-[15px] sm:text-[17px] lg:text-[20px] font-black tracking-[0.2em] text-white uppercase font-montserrat">
                Banca do Jonas
              </span>
            </div>
            <span className="text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase">
              Conveniência e Tabacaria
            </span>
          </div>

          {/* Badge */}
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded-full bg-[#D4AF37]/8">
            Pré-Reserva Oficial Limitada
          </span>

          {/* Headline */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-white/75">
              Garanta seu Álbum Oficial
            </p>
            <h1 className="text-[2.6rem] sm:text-[3.2rem] lg:text-[4rem] font-black uppercase tracking-tight gold-text leading-none font-montserrat">
              Copa do Mundo
            </h1>
            <p className="text-[4.5rem] sm:text-[5.5rem] lg:text-[7rem] font-black gold-text leading-none font-playfair">
              2026
            </p>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/65 pt-1">
              Antes do Lançamento Oficial
            </p>
          </div>

          {/* Countdown */}
          <div className="w-full">
            <p className="text-[9px] font-bold tracking-[0.35em] uppercase text-white/40 mb-4">
              Lançamento em
            </p>
            <Countdown />
          </div>

          {/* CTA */}
          <div className="w-full pt-1 space-y-2.5">
            <button
              onClick={scrollToCatalog}
              className="w-full flex items-center justify-center gap-2.5 bg-[#D4AF37] text-black font-black text-[13px] tracking-[0.18em] uppercase py-4 rounded-xl hover:bg-[#E8C44A] active:bg-[#C9A030] transition-colors shadow-lg shadow-[#D4AF37]/20"
            >
              <Trophy className="w-4 h-4" />
              Garantir Prioridade
            </button>
            <p className="text-[10px] text-white/35">Sinal de 20% · Menos de 1 minuto</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COPA 2026 — SEÇÃO DEDICADA
      ═══════════════════════════════════════════════════════════ */}
      {copaProdutos.length > 0 && (
        <section
          id="copa-2026"
          className="relative bg-gradient-to-b from-[#0A0800] via-black to-black border-t border-[#D4AF37]/20 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Glow dourado sutil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
            }}
          />

          <div className="relative max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto">
            {/* Cabeçalho da seção */}
            <div className="text-center mb-8 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#D4AF37]/80">
                  Edição Limitada
                </span>
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <h2 className="text-[1.85rem] sm:text-3xl lg:text-4xl font-black gold-text tracking-widest uppercase font-montserrat">
                Produtos Copa 2026
              </h2>
              <p className="text-xs font-black tracking-[0.35em] text-[#D4AF37]/70 uppercase font-montserrat">
                {copaCategoria?.icone ?? '🏆'} Coleção Oficial
              </p>
              <p className="text-sm text-white/50 max-w-md mx-auto pt-1">
                Álbuns, figurinhas e itens exclusivos da Copa do Mundo FIFA 2026
              </p>
            </div>

            {/* Grid / Lista de produtos Copa */}
            {copaProdutos.some((p) => p.imagem_url) ? (
              <div className="border border-[#D4AF37]/25 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#080600]">
                {copaProdutos.map((p) => (
                  <ItemCard
                    key={p.id}
                    produto={p}
                    qty={qtys[p.id] || 0}
                    onQtyChange={(v) => setQty(p.id, v)}
                  />
                ))}
              </div>
            ) : (
              <div className="border border-[#D4AF37]/25 rounded-xl bg-[#080600] p-3 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {copaProdutos.map((p, idx) => (
                  <ComboCard
                    key={p.id}
                    produto={p}
                    qty={qtys[p.id] || 0}
                    onQtyChange={(v) => setQty(p.id, v)}
                    featured={idx === 0}
                    badge={idx === 0 ? 'EDIÇÃO LIMITADA' : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CATÁLOGO
      ═══════════════════════════════════════════════════════════ */}
      <section id="catalogo" className="bg-black py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-2xl lg:max-w-5xl mx-auto">
          {/* Cabeçalho da seção */}
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-[1.85rem] sm:text-3xl lg:text-4xl font-black gold-text tracking-widest uppercase font-montserrat">
              Catálogo Oficial
            </h2>
            <p className="text-xs font-black tracking-[0.35em] text-[#D4AF37]/70 uppercase font-montserrat">
              2026
            </p>
            <p className="text-sm text-white/50 mt-2">
              Selecione os itens da sua pré-reserva exclusiva
            </p>
          </div>

          {/* Seções por categoria */}
          {porCategoria.map(({ cat, items }, catIdx) => {
            const hasImages = items.some((p) => p.imagem_url);

            return (
              <div key={cat.id} className="mb-7">
                {/* Header da categoria */}
                <div className="bg-[#0E0E0E] border border-[#252525] rounded-t-xl px-4 py-3">
                  <h3 className="text-[11px] font-black tracking-[0.25em] uppercase text-white/85 font-montserrat">
                    {cat.icone && <span className="mr-2">{cat.icone}</span>}
                    {cat.nome}
                  </h3>
                </div>

                {hasImages ? (
                  /* Grid com imagens */
                  <div className="border border-t-0 border-[#252525] rounded-b-xl p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 bg-[#060606]">
                    {items.map((p) => (
                      <ItemCard
                        key={p.id}
                        produto={p}
                        qty={qtys[p.id] || 0}
                        onQtyChange={(v) => setQty(p.id, v)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Lista combos */
                  <div className="border border-t-0 border-[#252525] rounded-b-xl bg-[#060606] p-3 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                    {items.map((p, idx) => (
                      <ComboCard
                        key={p.id}
                        produto={p}
                        qty={qtys[p.id] || 0}
                        onQtyChange={(v) => setQty(p.id, v)}
                        featured={catIdx === 0 && idx === 0}
                        badge={catIdx === 0 && idx === 0 ? 'ÁLBUM GRÁTIS' : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Produtos sem categoria */}
          {semCategoria.length > 0 && (
            <div className="mb-7">
              <div className="bg-[#0E0E0E] border border-[#252525] rounded-t-xl px-4 py-3">
                <h3 className="text-[11px] font-black tracking-[0.25em] uppercase text-white/85 font-montserrat">
                  📦 Produtos
                </h3>
              </div>
              <div className="border border-t-0 border-[#252525] rounded-b-xl bg-[#060606]">
                {semCategoria.some((p) => p.imagem_url) ? (
                  <div className="p-3 grid grid-cols-2 gap-3">
                    {semCategoria.map((p) => (
                      <ItemCard
                        key={p.id}
                        produto={p}
                        qty={qtys[p.id] || 0}
                        onQtyChange={(v) => setQty(p.id, v)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {semCategoria.map((p, idx) => (
                      <ComboCard
                        key={p.id}
                        produto={p}
                        qty={qtys[p.id] || 0}
                        onQtyChange={(v) => setQty(p.id, v)}
                        featured={idx === 0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {produtos.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm">Nenhum produto disponível no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PONTOS DE RETIRADA
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#060606] border-t border-[#1a1a1a] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gold-text-soft font-playfair italic">
              Pontos de Retirada
            </h2>
            <p className="text-sm text-white/45 mt-1">Escolha a unidade mais próxima de você</p>
          </div>

          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {[
              {
                name: 'BANCA DO JONAS — Unidade 1 — CENTRO',
                addr: 'Praça Afonso Pena, 245 - Centro',
                ref: 'Próximo ao Armarinho Fernando',
                maps: 'https://www.google.com/maps/search/?api=1&query=Pra%C3%A7a+Afonso+Pena+245+Centro+S%C3%A3o+Jos%C3%A9+dos+Campos',
                waze: 'https://waze.com/ul?q=Pra%C3%A7a+Afonso+Pena+245+Centro+S%C3%A3o+Jos%C3%A9+dos+Campos',
              },
              {
                name: 'BANCA DO JONAS — Unidade 2 — VISTA VERDE',
                addr: 'Rua Gustavo Rico Toro, 510 - Vista Verde',
                ref: "Próximo ao McDonald's",
                maps: 'https://www.google.com/maps/search/?api=1&query=Rua+Gustavo+Rico+Toro+510+Vista+Verde+S%C3%A3o+Jos%C3%A9+dos+Campos',
                waze: 'https://waze.com/ul?q=Rua+Gustavo+Rico+Toro+510+Vista+Verde+S%C3%A3o+Jos%C3%A9+dos+Campos',
              },
            ].map((loc, i) => (
              <div key={i} className="border border-[#252525] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-black text-white uppercase tracking-wide font-montserrat">
                      {loc.name}
                    </p>
                    <p className="text-xs text-[#D4AF37]/65 mt-0.5">{loc.addr}</p>
                    <p className="text-xs text-white/35">{loc.ref}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={loc.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-white/80 border border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:border-[#D4AF37]/40 hover:text-white transition-colors"
                  >
                    📍 Google Maps
                  </a>
                  <a
                    href={loc.waze}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-white/80 border border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:border-[#D4AF37]/40 hover:text-white transition-colors"
                  >
                    🧭 Waze
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-black border-t border-[#1a1a1a] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center gold-text-soft font-playfair italic mb-6">
            Perguntas Frequentes
          </h2>
          <Faq />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RODAPÉ
      ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#060606] border-t border-[#1a1a1a] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center mb-6">
            {[
              { icon: '📦', text: 'Retirada rápida em 2 unidades' },
              { icon: '⭐', text: 'Garantia Banca do Jonas' },
              { icon: '💬', text: 'Suporte direto para colecionadores' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-xl">{b.icon}</span>
                <p className="text-[10px] text-white/40 leading-tight">{b.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-white/25">
            Banca do Jonas — Muito mais que só uma conveniência, uma experiência.
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          BOTÃO FLUTUANTE WHATSAPP
      ═══════════════════════════════════════════════════════════ */}
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed left-4 z-40 flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-lg shadow-black/40 hover:bg-[#20c15e] transition-all duration-300 ${
          cartItems.length > 0 ? 'bottom-20 sm:bottom-5' : 'bottom-5'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>

      {/* ═══════════════════════════════════════════════════════════
          CARRINHO FLUTUANTE (aparece quando há itens)
      ═══════════════════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-5 right-4 z-50 transition-all duration-300 ${
          cartItems.length > 0
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {cartOpen ? (
          <div className="w-[19rem] bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black tracking-[0.25em] uppercase text-[#D4AF37]">
                  Seu Carrinho
                </p>
                <p className="text-sm font-black text-white tabular-nums">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'} · R$ {fmt(total)}
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-white/40 hover:text-white text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
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
                  className="w-full flex items-center gap-3 bg-[#D4AF37] text-black font-black text-sm px-4 py-3 rounded-xl hover:bg-[#E8C44A] transition-colors"
                >
                  {pagamentoOnlineAtivo && retiradaLocalAtiva ? (
                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  ) : pagamentoOnlineAtivo ? (
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Store className="w-4 h-4 flex-shrink-0" />
                  )}
                  <div className="text-left flex-1">
                    <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-70 leading-none">
                      Fazer pedido online
                    </div>
                    <div className="text-[13px] font-black leading-snug mt-0.5">
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
                    ? 'bg-[#0F1F14] border border-[#25D366]/40 text-[#25D366] hover:bg-[#142a1c]'
                    : 'bg-[#25D366] text-white hover:bg-[#20c15e]'
                }`}
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-70 leading-none">
                    Reservar via WhatsApp
                  </div>
                  <div className="text-[13px] font-black leading-snug mt-0.5">
                    Pré-reserva com sinal de 20%
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              // Se só houver uma opção (WhatsApp) vai direto
              if (!canCheckout) {
                handleWhatsApp();
              } else {
                setCartOpen(true);
              }
            }}
            className="flex items-center gap-3 bg-[#D4AF37] text-black font-black text-sm px-4 py-3 rounded-xl shadow-xl shadow-[#D4AF37]/25 hover:bg-[#E8C44A] active:bg-[#C9A030] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <div className="text-left">
              <div className="text-[9px] font-black tracking-[0.2em] uppercase opacity-60 leading-none">
                {canCheckout ? 'Finalizar pedido' : 'Finalizar via WhatsApp'}
              </div>
              <div className="text-[17px] font-black leading-snug tabular-nums">
                R$ {fmt(total)}
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Modal de checkout online */}
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
        onSuccess={() => {
          // Limpa carrinho ao concluir
          setQtys({});
        }}
      />
    </div>
  );
}
