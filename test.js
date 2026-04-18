const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: vendas, error: err1 } = await supabase
    .from('vendas')
    .select('*, forma_pagamento:formas_pagamento(nome, icone)')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('vendas:', vendas ? vendas.length : 0, err1 ? err1 : 'no err');
  if (vendas && vendas.length > 0) {
    console.log("Most recent sale date in DB:", vendas[0].created_at);
  }

  const inicioDia = new Date('2024-01-01').toISOString();
  const fimDia = new Date('2027-01-01').toISOString();

  const { data: itens, error: err2 } = await supabase
    .from('venda_itens')
    .select(`
      quantidade,
      preco_unitario,
      produto:produtos(nome),
      vendas!inner(created_at)
    `)
    .gte('vendas.created_at', inicioDia)
    .lte('vendas.created_at', fimDia)
    .order('quantidade', { ascending: false });

  console.log('venda_itens:', itens ? itens.length : 0, err2 ? err2 : 'no err');
}

test();
