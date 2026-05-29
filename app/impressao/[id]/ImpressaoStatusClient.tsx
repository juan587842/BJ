'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle, Loader2, Printer, Home } from 'lucide-react';
import type { Impressao, ImpressaoStatus } from '@/types';

interface ImpressaoView {
  id: string;
  numero: number;
  status: ImpressaoStatus;
  total_centavos: number;
  modo_cor: string;
  quantidade_folhas: number;
  tipo_impressao_nome: string;
  tipo_pagamento: string;
  cliente_nome: string;
  sumup_checkout_id: string | null;
}

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const META: Record<ImpressaoStatus, { label: string; cor: string; Icon: any; desc: string }> = {
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
    desc: 'Pagamento recebido! Sua impressão será preparada.',
  },
  em_producao: {
    label: 'Em produção',
    cor: 'text-indigo-400',
    Icon: Printer,
    desc: 'Sua impressão está sendo preparada.',
  },
  concluido: {
    label: 'Impressão pronta',
    cor: 'text-emerald-400',
    Icon: CheckCircle2,
    desc: 'Sua impressão está pronta para retirada!',
  },
  cancelado: {
    label: 'Cancelada',
    cor: 'text-red-400',
    Icon: XCircle,
    desc: 'O pagamento não foi concluído ou a impressão foi cancelada.',
  },
};

export default function ImpressaoStatusClient({ impressao: initial }: { impressao: Impressao }) {
  const [impressao, setImpressao] = useState<ImpressaoView>({
    id: initial.id,
    numero: initial.numero,
    status: initial.status,
    total_centavos: initial.total_centavos,
    modo_cor: initial.modo_cor,
    quantidade_folhas: initial.quantidade_folhas,
    tipo_impressao_nome: initial.tipo_impressao_nome,
    tipo_pagamento: initial.tipo_pagamento,
    cliente_nome: initial.cliente_nome,
    sumup_checkout_id: initial.sumup_checkout_id,
  });

  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    if (impressao.status !== 'pendente' || impressao.tipo_pagamento !== 'online') return;
    if (!impressao.sumup_checkout_id) return;

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
          body: JSON.stringify({ impressao_id: impressao.id }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.status && d.status !== impressao.status) {
            setImpressao((p) => ({ ...p, status: d.status }));
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
  }, [impressao.id, impressao.status, impressao.tipo_pagamento, impressao.sumup_checkout_id]);

  const meta = META[impressao.status] ?? META.pendente;
  const Icon = meta.Icon;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111] border border-[#D4AF37]/20 rounded-2xl p-7 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${meta.cor}`}>
            <Icon className="w-9 h-9" />
          </div>
          <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#D4AF37]">
            Impressão #{String(impressao.numero).padStart(4, '0')}
          </p>
          <h1 className={`text-2xl font-black mt-1 ${meta.cor}`}>{meta.label}</h1>
          <p className="text-sm text-white/60 mt-2 max-w-xs">{meta.desc}</p>

          <div className="mt-6 w-full border-t border-white/5 pt-5 space-y-2 text-sm">
            {impressao.cliente_nome && (
              <div className="flex justify-between">
                <span className="text-white/50">Cliente</span>
                <span className="font-medium">{impressao.cliente_nome}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/50">Tipo</span>
              <span className="font-medium">{impressao.tipo_impressao_nome} — {impressao.modo_cor === 'pb' ? 'P&B' : 'Colorida'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Folhas</span>
              <span className="font-medium">{impressao.quantidade_folhas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Pagamento</span>
              <span className="font-medium">
                {impressao.tipo_pagamento === 'online' ? 'Online (SumUp)' : 'Retirada no local'}
              </span>
            </div>
            <div className="flex justify-between text-base pt-2">
              <span className="text-white/50">Total</span>
              <span className="font-black text-[#D4AF37]">{fmt(impressao.total_centavos)}</span>
            </div>
          </div>

          {sincronizando && impressao.status === 'pendente' && (
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
