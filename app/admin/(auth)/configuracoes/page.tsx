import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConfiguracoesClient from './ConfiguracoesClient';
import type { SiteConfig } from '@/types';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  const config = data as SiteConfig | null;
  const modoAtual = config?.modo_catalogo ?? 'copa';

  return <ConfiguracoesClient modoAtual={modoAtual} />;
}
