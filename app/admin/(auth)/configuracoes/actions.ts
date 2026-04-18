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
