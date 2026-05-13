'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function marcarImpressaoPaga(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'pago', pago_em: new Date().toISOString() } as any)
    .eq('id', id)
    .eq('status', 'pendente');

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function iniciarProducaoImpressao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'em_producao' } as any)
    .eq('id', id)
    .in('status', ['pendente', 'pago']);

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function concluirImpressao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'concluido', concluido_em: new Date().toISOString() } as any)
    .eq('id', id)
    .in('status', ['em_producao', 'pago', 'pendente']);

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function cancelarImpressao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado.' };

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'cancelado', cancelado_em: new Date().toISOString() } as any)
    .eq('id', id)
    .not('status', 'in', '(concluido,cancelado)');

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function obterUrlArquivoImpressao(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'Não autorizado.' };

  const { data: imp, error } = await supabase
    .from('impressoes')
    .select('arquivo_path')
    .eq('id', id)
    .single();

  if (error || !imp) return { success: false as const, error: 'Não encontrada.' };

  const { data: signed, error: sErr } = await supabase.storage
    .from('impressoes')
    .createSignedUrl((imp as any).arquivo_path, 300);

  if (sErr || !signed) return { success: false as const, error: 'Erro ao gerar URL.' };

  return { success: true as const, url: signed.signedUrl };
}
