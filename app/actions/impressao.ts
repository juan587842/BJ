'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { criarCheckout, type SumupMode } from '@/lib/sumup/client';

export interface ImpressaoInput {
  cliente: {
    nome: string;
    whatsapp: string;
    email?: string;
  };
  tipo_impressao_id: string;
  modo_cor: 'pb' | 'colorida';
  quantidade_folhas: number;
  arquivo_path: string;
  arquivo_nome?: string;
  observacoes?: string;
  tipo_pagamento: 'online' | 'retirada_local';
}

export interface ImpressaoResult {
  success: boolean;
  error?: string;
  impressao_id?: string;
  impressao_numero?: number;
  checkout_url?: string | null;
}

export async function criarImpressao(input: ImpressaoInput): Promise<ImpressaoResult> {
  if (!input.cliente.nome?.trim() || !input.cliente.whatsapp?.trim()) {
    return { success: false, error: 'Nome e WhatsApp são obrigatórios.' };
  }
  if (!input.arquivo_path?.trim()) {
    return { success: false, error: 'Arquivo é obrigatório.' };
  }
  if (!input.tipo_impressao_id) {
    return { success: false, error: 'Tipo de impressão obrigatório.' };
  }
  if (!Number.isInteger(input.quantidade_folhas) || input.quantidade_folhas <= 0) {
    return { success: false, error: 'Quantidade de folhas inválida.' };
  }

  const admin = await createAdminClient();

  // Config do site
  const { data: config } = await admin
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (!config || !(config as any).impressoes_ativa) {
    return { success: false, error: 'Serviço de impressões está desativado.' };
  }
  if (input.tipo_pagamento === 'online' && !(config as any).pagamento_online_ativo) {
    return { success: false, error: 'Pagamento online está desativado.' };
  }
  if (input.tipo_pagamento === 'retirada_local' && !(config as any).retirada_local_ativa) {
    return { success: false, error: 'Retirada no local está desativada.' };
  }

  // Tipo de impressão
  const isDefaultId = input.tipo_impressao_id.startsWith('default-');
  let tipoId: string | null = null;
  let tipoNome = '';

  if (isDefaultId) {
    tipoNome = input.tipo_impressao_id === 'default-a4' ? 'A4' : input.tipo_impressao_id === 'default-a3' ? 'A3' : 'Ofício';
    tipoId = null;
  } else {
    const { data: tipo, error: tipoErr } = await admin
      .from('tipos_impressao')
      .select('id, nome, ativo')
      .eq('id', input.tipo_impressao_id)
      .single();

    if (tipoErr || !tipo || !(tipo as any).ativo) {
      return { success: false, error: 'Tipo de impressão indisponível.' };
    }
    tipoId = (tipo as any).id;
    tipoNome = (tipo as any).nome;
  }

  // Preço (server-side)
  const precoUnitario = input.modo_cor === 'pb'
    ? (config as any).impressao_preco_pb_centavos
    : (config as any).impressao_preco_colorida_centavos;
  const total = precoUnitario * input.quantidade_folhas;

  // Cliente: upsert por whatsapp
  const waNormalizado = input.cliente.whatsapp.replace(/\D/g, '');
  const { data: clienteUpsert, error: cliErr } = await admin
    .from('clientes')
    .upsert(
      {
        nome: input.cliente.nome.trim(),
        whatsapp: waNormalizado,
        email: input.cliente.email?.trim() || null,
      },
      { onConflict: 'whatsapp' }
    )
    .select('id')
    .single();

  if (cliErr || !clienteUpsert) {
    console.error('[impressao] erro ao upsert cliente:', cliErr);
    return { success: false, error: 'Erro ao registrar cliente.' };
  }

  const modoSumup: SumupMode = ((config as any).sumup_modo as SumupMode) ?? 'sandbox';

  // Insert impressão
  const { data: impressao, error: impErr } = await admin
    .from('impressoes')
    .insert({
      cliente_id: clienteUpsert.id,
      cliente_nome: input.cliente.nome.trim(),
      cliente_whatsapp: waNormalizado,
      cliente_email: input.cliente.email?.trim() || null,
      tipo_impressao_id: tipoId,
      tipo_impressao_nome: tipoNome,
      modo_cor: input.modo_cor,
      quantidade_folhas: input.quantidade_folhas,
      preco_unitario_centavos: precoUnitario,
      total_centavos: total,
      arquivo_path: input.arquivo_path,
      arquivo_nome: input.arquivo_nome?.trim() || null,
      observacoes: input.observacoes?.trim() || null,
      tipo_pagamento: input.tipo_pagamento,
      status: 'pendente',
      sumup_modo: input.tipo_pagamento === 'online' ? modoSumup : null,
    })
    .select('id, numero')
    .single();

  if (impErr || !impressao) {
    console.error('[impressao] erro ao criar:', impErr);
    return { success: false, error: 'Erro ao criar pedido de impressão.' };
  }

  // SumUp se online
  let checkoutUrl: string | null = null;
  if (input.tipo_pagamento === 'online') {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
      const returnUrl = siteUrl ? `${siteUrl}/impressao/${(impressao as any).id}` : undefined;
      const checkout = await criarCheckout(modoSumup, {
        pedidoId: (impressao as any).id,
        pedidoNumero: (impressao as any).numero,
        valorCentavos: total,
        descricao: `Banca do Jonas — Impressão #${String((impressao as any).numero).padStart(4, '0')}`,
        clienteEmail: input.cliente.email ?? null,
        returnUrl,
      });
      if (checkout) {
        checkoutUrl = checkout.checkoutUrl;
        await admin
          .from('impressoes')
          .update({ sumup_checkout_id: checkout.checkoutId })
          .eq('id', (impressao as any).id);
      }
    } catch (e) {
      console.error('[impressao] erro SumUp:', e);
    }
  }

  return {
    success: true,
    impressao_id: (impressao as any).id,
    impressao_numero: (impressao as any).numero,
    checkout_url: checkoutUrl,
  };
}
