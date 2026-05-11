import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { consultarCheckout, type SumupMode } from '@/lib/sumup/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook SumUp: recebe notificação de mudança de status de checkout
 * e atualiza o pedido. Sempre consulta a API SumUp como fonte da verdade
 * (não confia no payload do webhook).
 *
 * SumUp envia POST JSON com `id` (checkout id) e `event_type`. Verificação
 * de assinatura HMAC não é uniforme entre planos — aqui revalidamos via API.
 */
export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const checkoutId: string | undefined = payload?.id ?? payload?.checkout_id ?? payload?.resource_id;
  if (!checkoutId) {
    return NextResponse.json({ error: 'missing checkout id' }, { status: 400 });
  }

  const admin = await createAdminClient();

  const { data: pedido } = await admin
    .from('pedidos')
    .select('id, status, total_centavos, sumup_modo')
    .eq('sumup_checkout_id', checkoutId)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ error: 'pedido not found' }, { status: 404 });
  }

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
  } else if ((status.status === 'FAILED' || status.status === 'EXPIRED') && pedido.status === 'pendente') {
    await admin
      .from('pedidos')
      .update({ status: 'cancelado', cancelado_em: new Date().toISOString() })
      .eq('id', pedido.id)
      .eq('status', 'pendente');
  }

  return NextResponse.json({ ok: true, status: status.status });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
