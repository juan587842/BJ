import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConfiguracoesClient from './ConfiguracoesClient';
import type { SiteConfig, TipoImpressao } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data } = await supabase
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  const config = ((data as SiteConfig | null) ?? {
    id: 1,
    modo_catalogo: 'copa',
    pedidos_online_ativo: true,
    pagamento_online_ativo: true,
    retirada_local_ativa: true,
    sumup_modo: 'sandbox',
    impressoes_ativa: false,
    impressao_preco_pb_centavos: 50,
    impressao_preco_colorida_centavos: 150,
    updated_at: new Date().toISOString(),
  }) as SiteConfig;

  const { data: tiposData } = await supabase
    .from('tipos_impressao')
    .select('*')
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true });
  const tipos = (tiposData as TipoImpressao[] | null) ?? [];

  return <ConfiguracoesClient config={config} tiposImpressao={tipos} />;
}
