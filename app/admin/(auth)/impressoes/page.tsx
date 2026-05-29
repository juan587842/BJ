import { createClient } from '@/lib/supabase/server';
import ImpressoesClient from './ImpressoesClient';
import type { Impressao, TipoImpressao } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ImpressoesAdminPage() {
  const supabase = await createClient();

  let impressoes = null;
  try {
    const { data: rawData, error } = await supabase
      .from('impressoes')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) impressoes = rawData;
  } catch (e) {
    console.error('[ImpressoesAdminPage]', e);
  }

  let tipos = null;
  try {
    const { data: rawData, error } = await supabase
      .from('tipos_impressao')
      .select('*')
      .order('ordem', { ascending: true });
    if (!error) tipos = rawData;
  } catch (e) {
    console.error('[ImpressoesAdminPage]', e);
  }

  return (
    <ImpressoesClient
      impressoes={(impressoes as Impressao[] | null) ?? []}
      tipos={(tipos as TipoImpressao[] | null) ?? []}
    />
  );
}
