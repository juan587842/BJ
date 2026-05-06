'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Categoria, Fornecedor, Produto } from '@/types';
import { X, Calendar, Percent, DollarSign, Hash } from 'lucide-react';
import ImageUploader from '@/components/shared/ImageUploader';

interface Props {
  produtoExistente?: Produto | null;
  onSave: () => void;
  onClose: () => void;
}

function hojeISO() { return new Date().toISOString().slice(0, 10); }
function addDiasISO(dias: number) {
  const d = new Date(); d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default function ConsignacaoModal({ produtoExistente, onSave, onClose }: Props) {
  const supabase = createClient();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const [nome, setNome] = useState(produtoExistente?.nome || '');
  const [codigoBarras, setCodigoBarras] = useState(produtoExistente?.codigo_barras || '');
  const [descricao, setDescricao] = useState(produtoExistente?.descricao || '');
  const [preco, setPreco] = useState(produtoExistente ? String(produtoExistente.preco) : '');
  const [categoriaId, setCategoriaId] = useState(produtoExistente?.categoria_id || '');
  const [imagemUrl, setImagemUrl] = useState(produtoExistente?.imagem_url || '');

  const [fornecedorId, setFornecedorId] = useState('');
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(addDiasISO(7));
  const [quantidadeRecebida, setQuantidadeRecebida] = useState('');
  const [precoFornecedor, setPrecoFornecedor] = useState('');
  const [comissaoPct, setComissaoPct] = useState('25');
  const [observacoes, setObservacoes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: forns }] = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('fornecedores').select('*').order('nome'),
      ]);
      if (cats) setCategorias(cats as Categoria[]);
      if (forns) setFornecedores(forns as Fornecedor[]);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fornecedorId) { setError('Selecione um fornecedor'); return; }
    if (new Date(dataFim) < new Date(dataInicio)) { setError('Data fim antes da data início'); return; }
    setSaving(true);

    let produtoId = produtoExistente?.id;

    if (!produtoId) {
      const { data: prod, error: errProd } = await (supabase as any).from('produtos').insert({
        nome,
        codigo_barras: codigoBarras || null,
        descricao: descricao || null,
        preco: parseFloat(preco) || 0,
        quantidade: parseInt(quantidadeRecebida) || 0,
        quantidade_minima: 1,
        categoria_id: categoriaId || null,
        imagem_url: imagemUrl || null,
        tipo: 'comissionado',
        ativo: true,
      }).select('id').single();

      if (errProd) { setSaving(false); setError(errProd.message); return; }
      produtoId = prod.id;
    } else {
      // renovar: encerrar consignação atual se existir
      if (produtoExistente?.consignacao_id) {
        await (supabase as any).from('consignacoes')
          .update({ status: 'encerrada' })
          .eq('id', produtoExistente.consignacao_id);
      }
      // somar qtd ao estoque + atualizar dados básicos
      const novaQtd = (produtoExistente?.quantidade || 0) + (parseInt(quantidadeRecebida) || 0);
      await (supabase as any).from('produtos').update({
        nome,
        codigo_barras: codigoBarras || null,
        descricao: descricao || null,
        preco: parseFloat(preco) || 0,
        quantidade: novaQtd,
        categoria_id: categoriaId || null,
        imagem_url: imagemUrl || null,
      }).eq('id', produtoId);
    }

    const { data: cons, error: errCons } = await (supabase as any).from('consignacoes').insert({
      fornecedor_id: fornecedorId,
      produto_id: produtoId,
      data_inicio: dataInicio,
      data_fim: dataFim,
      quantidade_recebida: parseInt(quantidadeRecebida) || 0,
      preco_fornecedor: parseFloat(precoFornecedor) || 0,
      comissao_percentual: parseFloat(comissaoPct) || 25,
      status: 'ativa',
      observacoes: observacoes || null,
    }).select('id').single();

    if (errCons) { setSaving(false); setError(errCons.message); return; }

    await (supabase as any).from('produtos').update({ consignacao_id: cons.id }).eq('id', produtoId);

    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {produtoExistente ? 'Nova Remessa (Renovar)' : 'Novo Produto Comissionado'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Produto</h3>
            <ImageUploader currentImageUrl={imagemUrl} onImageChange={(url) => setImagemUrl(url || '')} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome *</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="input-field" placeholder="Ex: Revista XYZ - Edição 42" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Código de barras</label>
                <input type="text" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} className="input-field font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="input-field">
                  <option value="">Sem categoria</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preço de venda (R$) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} required className="input-field pl-9" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="input-field resize-none" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Consignação</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fornecedor *</label>
              <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required className="input-field">
                <option value="">Selecione...</option>
                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
              {fornecedores.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Cadastre um fornecedor antes em /admin/fornecedores</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data início *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data fim *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required className="input-field pl-9" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Qtd recebida *</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" min="0" value={quantidadeRecebida} onChange={(e) => setQuantidadeRecebida(e.target.value)} required className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preço fornecedor</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" step="0.01" min="0" value={precoFornecedor} onChange={(e) => setPrecoFornecedor(e.target.value)} className="input-field pl-9" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Comissão (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="number" step="0.01" min="0" max="100" value={comissaoPct} onChange={(e) => setComissaoPct(e.target.value)} className="input-field pl-9" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações</label>
              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="input-field resize-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Salvando...' : produtoExistente ? 'Renovar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
