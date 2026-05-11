import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import PedidoStatusClient from './PedidoStatusClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoStatusPage({ params }: Props) {
  const { id } = await params;
  const admin = await createAdminClient();

  const { data: pedido } = await admin
    .from('pedidos')
    .select('id, numero, status, total_centavos, tipo_pagamento, sumup_checkout_id, cliente_nome')
    .eq('id', id)
    .maybeSingle();

  if (!pedido) notFound();

  return <PedidoStatusClient pedido={pedido as any} />;
}
