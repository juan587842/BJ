import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { consultarCheckout, type SumupMode } from '@/lib/sumup/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sincroniza o status do pedido com o SumUp sob demanda.
 * Usado pela página de retorno do cliente quando o webhook pode ainda
 * não ter chegado.
 */
export async function POST(req: NextRequest) {
  const { pedido_id } = await req.json().catch(() => ({}));
  if (!pedido_id || typeof pedido_id !== 'string') {
    return NextResponse.json({ error: 'missing pedido_id' }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data: pedido } = await admin
    .from('pedidos')
    .select('id, status, sumup_checkout_id, sumup_modo')
    .eq('id', pedido_id)
    .maybeSingle();

  if (!pedido) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (!pedido.sumup_checkout_id) {
    return NextResponse.json({ status: pedido.status });
  }
  if (pedido.status !== 'pendente') {
    return NextResponse.json({ status: pedido.status });
  }

  const modo: SumupMode = (pedido.sumup_modo as SumupMode) ?? 'sandbox';
  const sumup = await consultarCheckout(modo, pedido.sumup_checkout_id);
  if (!sumup) return NextResponse.json({ status: pedido.status });

  if (sumup.status === 'PAID') {
    await admin
      .from('pedidos')
      .update({
        status: 'pago',
        sumup_transaction_id: sumup.transactionId ?? sumup.transactionCode ?? null,
      })
      .eq('id', pedido.id)
      .eq('status', 'pendente');
    return NextResponse.json({ status: 'pago' });
  }

  if (sumup.status === 'FAILED' || sumup.status === 'EXPIRED') {
    await admin
      .from('pedidos')
      .update({ status: 'cancelado', cancelado_em: new Date().toISOString() })
      .eq('id', pedido.id)
      .eq('status', 'pendente');
    return NextResponse.json({ status: 'cancelado' });
  }

  return NextResponse.json({ status: pedido.status });
}
