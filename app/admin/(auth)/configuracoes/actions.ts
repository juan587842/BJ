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

export interface ImpressoesConfigInput {
  impressoes_ativa: boolean;
  impressao_preco_pb_centavos: number;
  impressao_preco_colorida_centavos: number;
}

export async function atualizarConfigImpressoes(input: ImpressoesConfigInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  if (
    !Number.isInteger(input.impressao_preco_pb_centavos) ||
    !Number.isInteger(input.impressao_preco_colorida_centavos) ||
    input.impressao_preco_pb_centavos < 0 ||
    input.impressao_preco_colorida_centavos < 0
  ) {
    return { success: false, error: 'Preços inválidos.' };
  }

  const { error } = await supabase
    .from('site_config')
    .update({
      impressoes_ativa: input.impressoes_ativa,
      impressao_preco_pb_centavos: input.impressao_preco_pb_centavos,
      impressao_preco_colorida_centavos: input.impressao_preco_colorida_centavos,
    } as any)
    .eq('id', 1);

  if (error) return { success: false, error: 'Erro ao salvar configurações de impressões.' };

  revalidatePath('/');
  revalidatePath('/impressoes');
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export interface TipoImpressaoInput {
  nome: string;
  icone?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export async function criarTipoImpressao(input: TipoImpressaoInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  if (!input.nome?.trim()) return { success: false, error: 'Nome obrigatório.' };

  const { error } = await supabase.from('tipos_impressao').insert({
    nome: input.nome.trim(),
    icone: input.icone?.trim() || null,
    ordem: input.ordem ?? 0,
    ativo: input.ativo ?? true,
  } as any);

  if (error) return { success: false, error: 'Erro ao criar tipo.' };
  revalidatePath('/admin/configuracoes');
  revalidatePath('/impressoes');
  return { success: true };
}

export async function atualizarTipoImpressao(id: string, input: TipoImpressaoInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  if (!input.nome?.trim()) return { success: false, error: 'Nome obrigatório.' };

  const { error } = await supabase
    .from('tipos_impressao')
    .update({
      nome: input.nome.trim(),
      icone: input.icone?.trim() || null,
      ordem: input.ordem ?? 0,
      ativo: input.ativo ?? true,
    } as any)
    .eq('id', id);

  if (error) return { success: false, error: 'Erro ao atualizar tipo.' };
  revalidatePath('/admin/configuracoes');
  revalidatePath('/impressoes');
  return { success: true };
}

export async function deletarTipoImpressao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase.from('tipos_impressao').delete().eq('id', id);

  if (error) return { success: false, error: 'Não foi possível deletar (talvez em uso).' };
  revalidatePath('/admin/configuracoes');
  revalidatePath('/impressoes');
  return { success: true };
}
