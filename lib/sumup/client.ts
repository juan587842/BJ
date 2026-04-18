/**
 * SumUp — cliente de integração (scaffold)
 *
 * Esta camada está estruturada para alternar entre SANDBOX e PRODUÇÃO
 * via variáveis de ambiente. O modo efetivo também é controlado pelo
 * campo `site_config.sumup_modo`, que tem prioridade sobre o .env.
 *
 * Variáveis de ambiente esperadas:
 *   SUMUP_SANDBOX_API_KEY        — chave de API do ambiente sandbox
 *   SUMUP_SANDBOX_MERCHANT_CODE  — código do comerciante (sandbox)
 *   SUMUP_PROD_API_KEY           — chave de API de produção
 *   SUMUP_PROD_MERCHANT_CODE     — código do comerciante (produção)
 *   SUMUP_RETURN_URL             — URL de retorno após o pagamento
 *
 * Implementação da API REST: https://developer.sumup.com/
 */

export type SumupMode = 'sandbox' | 'producao';

interface SumupCredentials {
  apiKey: string;
  merchantCode: string;
  baseUrl: string;
}

export function getCredentials(modo: SumupMode): SumupCredentials | null {
  if (modo === 'sandbox') {
    const apiKey = process.env.SUMUP_SANDBOX_API_KEY;
    const merchantCode = process.env.SUMUP_SANDBOX_MERCHANT_CODE;
    if (!apiKey || !merchantCode) return null;
    return { apiKey, merchantCode, baseUrl: 'https://api.sumup.com' };
  }
  const apiKey = process.env.SUMUP_PROD_API_KEY;
  const merchantCode = process.env.SUMUP_PROD_MERCHANT_CODE;
  if (!apiKey || !merchantCode) return null;
  return { apiKey, merchantCode, baseUrl: 'https://api.sumup.com' };
}

export interface SumupCheckoutInput {
  pedidoId: string;
  pedidoNumero: number;
  valorCentavos: number;
  descricao: string;
  clienteEmail?: string | null;
  returnUrl?: string;
}

export interface SumupCheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
}

/**
 * Cria um checkout no SumUp. Retorna null quando as credenciais estão ausentes
 * (modo "scaffold": o pedido é criado, mas o redirecionamento ao gateway não
 * acontece — o admin pode confirmar manualmente no painel).
 */
export async function criarCheckout(
  modo: SumupMode,
  input: SumupCheckoutInput
): Promise<SumupCheckoutResult | null> {
  const creds = getCredentials(modo);
  if (!creds) {
    console.warn(
      `[SumUp] Credenciais ausentes para modo=${modo}. ` +
        'Configure SUMUP_*_API_KEY e SUMUP_*_MERCHANT_CODE no .env.local. ' +
        'Pedido foi criado, mas checkout não foi gerado.'
    );
    return null;
  }

  const body = {
    checkout_reference: `pedido-${input.pedidoNumero}-${input.pedidoId.slice(0, 8)}`,
    amount: input.valorCentavos / 100,
    currency: 'BRL',
    merchant_code: creds.merchantCode,
    description: input.descricao,
    return_url: input.returnUrl ?? process.env.SUMUP_RETURN_URL,
    ...(input.clienteEmail ? { customer_email: input.clienteEmail } : {}),
  };

  const res = await fetch(`${creds.baseUrl}/v0.1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error(`[SumUp] Falha ao criar checkout (${res.status}):`, txt);
    return null;
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) return null;

  // A URL de checkout hospedada segue o padrão abaixo em ambos os ambientes.
  // Em alguns fluxos pode-se usar SDK/Widget no front — aqui retornamos a
  // URL de redirecionamento hospedada para simplicidade.
  const checkoutUrl = `https://pay.sumup.com/checkout/${data.id}`;

  return { checkoutId: data.id, checkoutUrl };
}
