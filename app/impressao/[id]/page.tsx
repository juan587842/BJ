import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import ImpressaoStatusClient from './ImpressaoStatusClient';
import type { Impressao } from '@/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ImpressaoStatusPage({ params }: Props) {
  const { id } = await params;
  const admin = await createAdminClient();

  const { data: impressao } = await admin
    .from('impressoes')
    .select('id, numero, status, total_centavos, modo_cor, quantidade_folhas, tipo_impressao_nome, tipo_pagamento, cliente_nome, sumup_checkout_id')
    .eq('id', id)
    .maybeSingle();

  if (!impressao) notFound();

  return <ImpressaoStatusClient impressao={impressao as unknown as Impressao} />;
}
