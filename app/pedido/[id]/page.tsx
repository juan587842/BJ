import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import PedidoStatusClient, { type PedidoView } from './PedidoStatusClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoStatusPage({ params }: Props) {
  const { id } = await params;
  const admin = await createAdminClient();

  let pedido = null;
  try {
    const { data: rawData, error } = await admin
      .from('pedidos')
      .select('id, numero, status, total_centavos, tipo_pagamento, sumup_checkout_id, cliente_nome')
      .eq('id', id)
      .maybeSingle();
    if (!error) pedido = rawData;
  } catch (e) {
    console.error('[PedidoStatusPage]', e);
  }

  if (!pedido) notFound();

  return <PedidoStatusClient pedido={pedido as PedidoView} />;
}
