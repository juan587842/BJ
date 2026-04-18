import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/shared/LandingPage';
import CatalogoOriginal from '@/components/shared/CatalogoOriginal';
import type { SiteConfig } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CatalogoPage() {
  const supabase = await createClient();

  const [{ data: configData }, { data: produtos }, { data: categorias }] = await Promise.all([
    supabase.from('site_config').select('*').eq('id', 1).single(),
    supabase
      .from('produtos')
      .select('*, categoria:categorias(id, nome, icone)')
      .eq('ativo', true)
      .gt('quantidade', 0)
      .order('nome'),
    supabase.from('categorias').select('*').order('nome'),
  ]);

  const config = configData as SiteConfig | null;
  const modo = config?.modo_catalogo ?? 'copa';

  const produtosTyped = (produtos as any[]) || [];
  const categoriasTyped = (categorias as any[]) || [];

  const pedidosConfig = {
    pedidos_online_ativo: config?.pedidos_online_ativo ?? false,
    pagamento_online_ativo: config?.pagamento_online_ativo ?? false,
    retirada_local_ativa: config?.retirada_local_ativa ?? false,
  };

  if (modo === 'catalogo') {
    return <CatalogoOriginal produtos={produtosTyped} categorias={categoriasTyped} />;
  }

  return (
    <LandingPage
      produtos={produtosTyped}
      categorias={categoriasTyped}
      pedidosConfig={pedidosConfig}
    />
  );
}
