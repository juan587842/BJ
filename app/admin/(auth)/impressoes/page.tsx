import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ImpressoesClient from './ImpressoesClient';
import type { Impressao, TipoImpressao } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ImpressoesAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: impressoes } = await supabase
    .from('impressoes')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: tipos } = await supabase
    .from('tipos_impressao')
    .select('*')
    .order('ordem', { ascending: true });

  return (
    <ImpressoesClient
      impressoes={(impressoes as Impressao[] | null) ?? []}
      tipos={(tipos as TipoImpressao[] | null) ?? []}
    />
  );
}
