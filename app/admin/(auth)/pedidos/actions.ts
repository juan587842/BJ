'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function confirmarPedido(pedidoId: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  // RPC faz: valida estoque → baixa estoque → marca como confirmado (transacional)
  const { error } = await supabase.rpc('confirmar_pedido', {
    pedido_id_param: pedidoId,
  });

  if (error) {
    return { success: false, error: error.message || 'Erro ao confirmar pedido.' };
  }

  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function cancelarPedido(pedidoId: string, motivo?: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  // RPC atômica: valida status, devolve estoque (se confirmado), marca cancelado.
  const { error } = await supabase.rpc('cancelar_pedido', {
    pedido_id_param: pedidoId,
    motivo_param: motivo?.trim() || undefined,
  });

  if (error) {
    return { success: false, error: error.message || 'Erro ao cancelar pedido.' };
  }

  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function marcarComoPago(pedidoId: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

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
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { error } = await supabase
    .from('pedidos')
    .update({ status: 'concluido' })
    .eq('id', pedidoId)
    .eq('status', 'confirmado');

  if (error) return { success: false, error: 'Erro ao concluir pedido.' };
  revalidatePath('/admin/pedidos');
  return { success: true };
}
