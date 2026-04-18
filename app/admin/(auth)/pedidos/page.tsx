import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PedidosClient from './PedidosClient';
import type { Pedido, PedidoItem } from '@/types';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, itens:pedido_itens(*)')
    .order('created_at', { ascending: false })
    .limit(200);

  return <PedidosClient pedidos={(pedidos as (Pedido & { itens: PedidoItem[] })[]) || []} />;
}
