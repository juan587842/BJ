'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function marcarImpressaoPaga(id: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pendente');

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function iniciarProducaoImpressao(id: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'em_producao' })
    .eq('id', id)
    .in('status', ['pendente', 'pago']);

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function concluirImpressao(id: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'concluido', concluido_em: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['em_producao', 'pago', 'pendente']);

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function cancelarImpressao(id: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { error } = await supabase
    .from('impressoes')
    .update({ status: 'cancelado', cancelado_em: new Date().toISOString() })
    .eq('id', id)
    .not('status', 'in', '(concluido,cancelado)');

  if (error) return { success: false, error: 'Erro.' };
  revalidatePath('/admin/impressoes');
  return { success: true };
}

export async function obterUrlArquivoImpressao(id: string) {
  const admin = await requireAdmin();
  if ('error' in admin) return { success: false as const, error: 'Não autorizado.' };
  const { supabase } = admin;

  const { data: imp, error } = await supabase
    .from('impressoes')
    .select('arquivo_path')
    .eq('id', id)
    .single();

  if (error || !imp) return { success: false as const, error: 'Não encontrada.' };

  const { data: signed, error: sErr } = await supabase.storage
    .from('impressoes')
    .createSignedUrl(imp.arquivo_path, 300);

  if (sErr || !signed) return { success: false as const, error: 'Erro ao gerar URL.' };

  return { success: true as const, url: signed.signedUrl };
}
