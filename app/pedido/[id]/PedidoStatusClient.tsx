'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, Loader2, Home } from 'lucide-react';

interface PedidoView {
  id: string;
  numero: number;
  status: 'pendente' | 'pago' | 'confirmado' | 'cancelado' | 'concluido';
  total_centavos: number;
  tipo_pagamento: 'online' | 'retirada_local';
  sumup_checkout_id: string | null;
  cliente_nome: string | null;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const META: Record<PedidoView['status'], { label: string; cor: string; Icon: any; desc: string }> = {
  pendente: {
    label: 'Aguardando pagamento',
    cor: 'text-amber-400',
    Icon: Clock,
    desc: 'Estamos confirmando o pagamento com o SumUp.',
  },
  pago: {
    label: 'Pagamento confirmado',
    cor: 'text-emerald-400',
    Icon: CheckCircle2,
    desc: 'Pagamento recebido. A banca já foi notificada.',
  },
  confirmado: {
    label: 'Pedido confirmado',
    cor: 'text-indigo-400',
    Icon: CheckCircle2,
    desc: 'A banca confirmou seu pedido e está preparando.',
  },
  concluido: {
    label: 'Pedido concluído',
    cor: 'text-emerald-400',
    Icon: CheckCircle2,
    desc: 'Pedido finalizado. Obrigado pela preferência!',
  },
  cancelado: {
    label: 'Pedido cancelado',
    cor: 'text-red-400',
    Icon: XCircle,
    desc: 'O pagamento não foi concluído ou o pedido foi cancelado.',
  },
};

export default function PedidoStatusClient({ pedido: initial }: { pedido: PedidoView }) {
  const [pedido, setPedido] = useState<PedidoView>(initial);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    if (pedido.status !== 'pendente' || pedido.tipo_pagamento !== 'online') return;
    if (!pedido.sumup_checkout_id) return;

    let cancelado = false;
    let tentativas = 0;

    const tick = async () => {
      if (cancelado) return;
      tentativas++;
      setSincronizando(true);
      try {
        const res = await fetch('/api/sumup/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pedido_id: pedido.id }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.status && d.status !== pedido.status) {
            setPedido((p) => ({ ...p, status: d.status }));
          }
        }
      } catch {}
      setSincronizando(false);
      if (tentativas < 30 && !cancelado) {
        setTimeout(tick, 4000);
      }
    };

    const t = setTimeout(tick, 1500);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [pedido.id, pedido.status, pedido.tipo_pagamento, pedido.sumup_checkout_id]);

  const meta = META[pedido.status];
  const Icon = meta.Icon;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111] border border-[#D4AF37]/20 rounded-2xl p-7 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${meta.cor}`}>
            <Icon className="w-9 h-9" />
          </div>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#D4AF37]">
            Pedido #{String(pedido.numero).padStart(4, '0')}
          </p>
          <h1 className={`text-2xl font-black font-montserrat mt-1 ${meta.cor}`}>{meta.label}</h1>
          <p className="text-sm text-white/60 mt-2 max-w-xs">{meta.desc}</p>

          <div className="mt-6 w-full border-t border-white/5 pt-5 space-y-2 text-sm">
            {pedido.cliente_nome && (
              <div className="flex justify-between">
                <span className="text-white/50">Cliente</span>
                <span className="font-medium">{pedido.cliente_nome}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/50">Pagamento</span>
              <span className="font-medium">
                {pedido.tipo_pagamento === 'online' ? 'Online (SumUp)' : 'Retirada no local'}
              </span>
            </div>
            <div className="flex justify-between text-base pt-2">
              <span className="text-white/50">Total</span>
              <span className="font-black text-[#D4AF37]">{fmt(pedido.total_centavos)}</span>
            </div>
          </div>

          {sincronizando && pedido.status === 'pendente' && (
            <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
              <Loader2 className="w-3 h-3 animate-spin" />
              Verificando pagamento...
            </div>
          )}

          <Link
            href="/"
            className="mt-7 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-sm hover:bg-[#E5C158] transition"
          >
            <Home className="w-4 h-4" />
            Voltar à loja
          </Link>
        </div>
      </div>
    </div>
  );
}
