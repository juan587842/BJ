'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function confirmarPedido(pedidoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  // RPC faz: valida estoque → baixa estoque → marca como confirmado (transacional)
  const { error } = await supabase.rpc('confirmar_pedido', {
    pedido_id_param: pedidoId,
  } as any);

  if (error) {
    return { success: false, error: error.message || 'Erro ao confirmar pedido.' };
  }

  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function cancelarPedido(pedidoId: string, motivo?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('pedidos')
    .update({
      status: 'cancelado',
      cancelado_em: new Date().toISOString(),
      observacoes: motivo || null,
    })
    .eq('id', pedidoId)
    .in('status', ['pendente', 'pago']);

  if (error) {
    return { success: false, error: 'Erro ao cancelar pedido.' };
  }

  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function marcarComoPago(pedidoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('pedidos')
    .update({ status: 'pago' })
    .eq('id', pedidoId)
    .eq('status', 'pendente');

  if (error) return { success: false, error: 'Erro ao marcar como pago.' };
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function concluirPedido(pedidoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('pedidos')
    .update({ status: 'concluido' })
    .eq('id', pedidoId)
    .eq('status', 'confirmado');

  if (error) return { success: false, error: 'Erro ao concluir pedido.' };
  revalidatePath('/admin/pedidos');
  return { success: true };
}
