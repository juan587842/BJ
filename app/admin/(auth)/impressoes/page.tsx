import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ImpressoesClient from './ImpressoesClient';
import type { Impressao, TipoImpressao } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ImpressoesAdminPage() {
  const admin = await requireAdmin();
  if ('error' in admin) redirect('/admin/login');
  const { supabase } = admin;

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
