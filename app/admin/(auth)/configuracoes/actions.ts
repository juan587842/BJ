'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function atualizarModoCatalogo(modo: 'copa' | 'catalogo') {
  const supabase = await createClient();

  const { error: authError, data: { user } } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Não autorizado.' };
  }

  const { error } = await supabase
    .from('site_config')
    .update({ modo_catalogo: modo })
    .eq('id', 1);

  if (error) {
    return { success: false, error: 'Erro ao salvar configuração.' };
  }

  revalidatePath('/');
  return { success: true };
}

export interface PedidosConfigInput {
  pedidos_online_ativo: boolean;
  pagamento_online_ativo: boolean;
  retirada_local_ativa: boolean;
  sumup_modo: 'sandbox' | 'producao';
}

export async function atualizarConfigPedidos(input: PedidosConfigInput) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('site_config')
    .update({
      pedidos_online_ativo: input.pedidos_online_ativo,
      pagamento_online_ativo: input.pagamento_online_ativo,
      retirada_local_ativa: input.retirada_local_ativa,
      sumup_modo: input.sumup_modo,
    })
    .eq('id', 1);

  if (error) {
    return { success: false, error: 'Erro ao salvar configurações de pedidos.' };
  }

  revalidatePath('/');
  revalidatePath('/admin/pedidos');
  return { success: true };
}
