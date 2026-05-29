import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PedidosClient from './PedidosClient';
import type { Pedido, PedidoItem } from '@/types';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const admin = await requireAdmin();
  if ('error' in admin) redirect('/admin/login');
  const { supabase } = admin;

  let pedidos = null;
  try {
    const { data: rawData, error } = await supabase
      .from('pedidos')
      .select('*, itens:pedido_itens(*)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) pedidos = rawData;
  } catch (e) {
    console.error('[PedidosPage]', e);
  }

  return <PedidosClient pedidos={(pedidos as (Pedido & { itens: PedidoItem[] })[]) || []} />;
}
