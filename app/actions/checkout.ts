'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { criarCheckout, type SumupMode } from '@/lib/sumup/client';

export interface CheckoutItemInput {
  produto_id: string;
  quantidade: number;
}

export interface CheckoutInput {
  cliente: {
    nome: string;
    whatsapp: string;
    email?: string;
    cpf?: string;
  };
  tipo_pagamento: 'online' | 'retirada_local';
  itens: CheckoutItemInput[];
  observacoes?: string;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  pedido_id?: string;
  pedido_numero?: number;
  checkout_url?: string | null;
}

/**
 * Cria um pedido público (sem autenticação). Valida:
 *  - config de site: pedidos online ativos, tipo de pagamento permitido
 *  - itens: existem, estão ativos, têm estoque
 *  - cria/atualiza cliente pelo whatsapp
 *  - snapshot dos preços nos pedido_itens
 *  - se tipo_pagamento='online', cria checkout SumUp (ou retorna null se sem credenciais)
 */
export async function criarPedidoPublico(input: CheckoutInput): Promise<CheckoutResult> {
  // Validações básicas
  if (!input.cliente.nome?.trim() || !input.cliente.whatsapp?.trim()) {
    return { success: false, error: 'Nome e WhatsApp são obrigatórios.' };
  }
  if (!input.itens || input.itens.length === 0) {
    return { success: false, error: 'O pedido não pode estar vazio.' };
  }

  const supabase = await createClient();
  const admin = await createAdminClient();

  // 1. Config do site
  const { data: config } = await admin
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (!config || !config.pedidos_online_ativo) {
    return { success: false, error: 'Pedidos online estão desativados no momento.' };
  }
  if (input.tipo_pagamento === 'online' && !config.pagamento_online_ativo) {
    return { success: false, error: 'Pagamento online está desativado.' };
  }
  if (input.tipo_pagamento === 'retirada_local' && !config.retirada_local_ativa) {
    return { success: false, error: 'Retirada no local está desativada.' };
  }

  // 2. Buscar produtos e validar (snapshot de preços + valida estoque atual)
  const produtoIds = input.itens.map((i) => i.produto_id);
  const { data: produtos, error: produtosErr } = await admin
    .from('produtos')
    .select('id, nome, preco, quantidade, ativo')
    .in('id', produtoIds);

  if (produtosErr || !produtos) {
    return { success: false, error: 'Erro ao validar produtos.' };
  }

  const produtosById = new Map(produtos.map((p: any) => [p.id, p]));
  let totalCentavos = 0;
  const itensSnapshot: Array<{
    produto_id: string;
    produto_nome: string;
    preco_unitario_centavos: number;
    quantidade: number;
    subtotal_centavos: number;
  }> = [];

  for (const item of input.itens) {
    const prod: any = produtosById.get(item.produto_id);
    if (!prod || !prod.ativo) {
      return { success: false, error: `Produto indisponível.` };
    }
    if (item.quantidade <= 0) {
      return { success: false, error: 'Quantidade inválida.' };
    }
    if (prod.quantidade < item.quantidade) {
      return {
        success: false,
        error: `Estoque insuficiente para "${prod.nome}". Disponível: ${prod.quantidade}.`,
      };
    }
    const precoCentavos = Math.round(Number(prod.preco) * 100);
    const subtotal = precoCentavos * item.quantidade;
    totalCentavos += subtotal;
    itensSnapshot.push({
      produto_id: prod.id,
      produto_nome: prod.nome,
      preco_unitario_centavos: precoCentavos,
      quantidade: item.quantidade,
      subtotal_centavos: subtotal,
    });
  }

  // 3. Cliente: upsert por whatsapp
  const waNormalizado = input.cliente.whatsapp.replace(/\D/g, '');
  let clienteId: string | null = null;

  const { data: existente } = await admin
    .from('clientes')
    .select('id')
    .eq('whatsapp', waNormalizado)
    .maybeSingle();

  if (existente) {
    clienteId = existente.id;
    await admin
      .from('clientes')
      .update({
        nome: input.cliente.nome.trim(),
        email: input.cliente.email?.trim() || null,
        cpf: input.cliente.cpf?.replace(/\D/g, '') || null,
      })
      .eq('id', clienteId);
  } else {
    const { data: novoCliente, error: cliErr } = await admin
      .from('clientes')
      .insert({
        nome: input.cliente.nome.trim(),
        whatsapp: waNormalizado,
        email: input.cliente.email?.trim() || null,
        cpf: input.cliente.cpf?.replace(/\D/g, '') || null,
      })
      .select('id')
      .single();
    if (cliErr || !novoCliente) {
      return { success: false, error: 'Erro ao registrar cliente.' };
    }
    clienteId = novoCliente.id;
  }

  // 4. Criar pedido
  const modoSumup: SumupMode = (config.sumup_modo as SumupMode) ?? 'sandbox';
  const { data: pedido, error: pedErr } = await admin
    .from('pedidos')
    .insert({
      cliente_id: clienteId,
      cliente_nome: input.cliente.nome.trim(),
      cliente_whatsapp: waNormalizado,
      cliente_email: input.cliente.email?.trim() || null,
      cliente_cpf: input.cliente.cpf?.replace(/\D/g, '') || null,
      tipo_pagamento: input.tipo_pagamento,
      status: 'pendente',
      total_centavos: totalCentavos,
      observacoes: input.observacoes?.trim() || null,
      sumup_modo: input.tipo_pagamento === 'online' ? modoSumup : null,
    })
    .select('id, numero')
    .single();

  if (pedErr || !pedido) {
    console.error('[checkout] erro ao criar pedido:', pedErr);
    return { success: false, error: 'Erro ao criar pedido.' };
  }

  // 5. Criar itens
  const { error: itensErr } = await admin.from('pedido_itens').insert(
    itensSnapshot.map((i) => ({
      pedido_id: pedido.id,
      produto_id: i.produto_id,
      produto_nome: i.produto_nome,
      preco_unitario_centavos: i.preco_unitario_centavos,
      quantidade: i.quantidade,
      subtotal_centavos: i.subtotal_centavos,
    }))
  );

  if (itensErr) {
    console.error('[checkout] erro ao criar itens:', itensErr);
    await admin.from('pedidos').delete().eq('id', pedido.id);
    return { success: false, error: 'Erro ao registrar itens do pedido.' };
  }

  // 6. SumUp (apenas online) — falha não aborta o pedido
  let checkoutUrl: string | null = null;
  if (input.tipo_pagamento === 'online') {
    try {
      const checkout = await criarCheckout(modoSumup, {
        pedidoId: pedido.id,
        pedidoNumero: pedido.numero,
        valorCentavos: totalCentavos,
        descricao: `Banca do Jonas — Pedido #${String(pedido.numero).padStart(4, '0')}`,
        clienteEmail: input.cliente.email ?? null,
      });
      if (checkout) {
        checkoutUrl = checkout.checkoutUrl;
        await admin
          .from('pedidos')
          .update({ sumup_checkout_id: checkout.checkoutId })
          .eq('id', pedido.id);
      }
    } catch (e) {
      console.error('[checkout] erro SumUp:', e);
    }
  }

  return {
    success: true,
    pedido_id: pedido.id,
    pedido_numero: pedido.numero,
    checkout_url: checkoutUrl,
  };
}
