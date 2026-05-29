import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { consultarCheckout, type SumupMode } from '@/lib/sumup/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook SumUp: recebe notificação de mudança de status de checkout
 * e atualiza o pedido OU a impressão. Consulta a API SumUp como fonte da verdade.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'invalid content type' }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const checkoutId = payload?.id ?? payload?.checkout_id ?? payload?.resource_id;
  if (!checkoutId || typeof checkoutId !== 'string') {
    return NextResponse.json({ error: 'missing checkout id' }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Tenta achar em pedidos
  const { data: pedido } = await admin
    .from('pedidos')
    .select('id, status, total_centavos, sumup_modo')
    .eq('sumup_checkout_id', checkoutId)
    .maybeSingle();

  if (pedido) {
    const modo: SumupMode = (pedido.sumup_modo as SumupMode) ?? 'sandbox';
    const status = await consultarCheckout(modo, checkoutId);
    if (!status) {
      return NextResponse.json({ error: 'sumup query failed' }, { status: 502 });
    }

    if (status.status === 'PAID' && pedido.status === 'pendente') {
      const { error } = await admin
        .from('pedidos')
        .update({
          status: 'pago',
          sumup_transaction_id: status.transactionId ?? status.transactionCode ?? null,
        })
        .eq('id', pedido.id)
        .eq('status', 'pendente');

      if (error) {
        console.error('[sumup webhook] update pedido falhou:', error);
        return NextResponse.json({ error: 'update failed' }, { status: 500 });
      }
    } else if (
      (status.status === 'FAILED' || status.status === 'EXPIRED') &&
      pedido.status === 'pendente'
    ) {
      await admin
        .from('pedidos')
        .update({ status: 'cancelado', cancelado_em: new Date().toISOString() })
        .eq('id', pedido.id)
        .eq('status', 'pendente');
    }

    return NextResponse.json({ ok: true, kind: 'pedido', status: status.status });
  }

  // Tenta achar em impressoes
  const { data: impressao } = await admin
    .from('impressoes')
    .select('id, status, total_centavos, sumup_modo')
    .eq('sumup_checkout_id', checkoutId)
    .maybeSingle();

  if (impressao) {
    const modo: SumupMode = (impressao.sumup_modo as SumupMode) ?? 'sandbox';
    const status = await consultarCheckout(modo, checkoutId);
    if (!status) {
      return NextResponse.json({ error: 'sumup query failed' }, { status: 502 });
    }

    if (status.status === 'PAID' && impressao.status === 'pendente') {
      const { error } = await admin
        .from('impressoes')
        .update({
          status: 'pago',
          pago_em: new Date().toISOString(),
          sumup_transaction_id: status.transactionId ?? status.transactionCode ?? null,
        })
        .eq('id', impressao.id)
        .eq('status', 'pendente');

      if (error) {
        console.error('[sumup webhook] update impressao falhou:', error);
        return NextResponse.json({ error: 'update failed' }, { status: 500 });
      }
    } else if (
      (status.status === 'FAILED' || status.status === 'EXPIRED') &&
      impressao.status === 'pendente'
    ) {
      await admin
        .from('impressoes')
        .update({ status: 'cancelado', cancelado_em: new Date().toISOString() })
        .eq('id', impressao.id)
        .eq('status', 'pendente');
    }

    return NextResponse.json({ ok: true, kind: 'impressao', status: status.status });
  }

  return NextResponse.json({ error: 'pedido/impressao not found' }, { status: 404 });
}
