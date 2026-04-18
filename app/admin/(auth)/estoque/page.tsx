'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Produto, Categoria } from '@/types';
import { Plus, Edit2, Trash2, AlertTriangle, Search, LayoutGrid, List, Image as ImageIcon } from 'lucide-react';
import ProductModal from '@/components/shared/ProductModal';
import ProductDetailModal from '@/components/shared/ProductDetailModal';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function EstoquePage() {
  const supabase = createClient();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstoqueBaixo, setFilterEstoqueBaixo] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    let query = supabase.from('produtos').select('*, categoria:categorias(nome)').order('nome');
    if (search) query = query.or(`nome.ilike.%${search}%,codigo_barras.eq.${search}`);
    if (filterCategoria) query = query.eq('categoria_id', filterCategoria);
    const { data } = await query;
    let filtered = data || [];
    if (filterEstoqueBaixo) filtered = filtered.filter((p: any) => p.quantidade <= p.quantidade_minima);
    setProdutos(filtered as unknown as Produto[]);
    setLoading(false);
  };

  const fetchCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*').order('nome');
    if (data) setCategorias(data);
  };

  useEffect(() => { fetchProdutos(); fetchCategorias(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchProdutos(), 300); return () => clearTimeout(t); }, [search, filterCategoria, filterEstoqueBaixo]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await supabase.from('produtos').delete().eq('id', id);
    fetchProdutos();
  };

  const handleSave = async () => { setShowModal(false); setEditingProduto(null); fetchProdutos(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Estoque</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{produtos.length} produto{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditingProduto(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou código..." className="input-field pl-9" />
          </div>
          <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} className="input-field sm:w-48">
            <option value="">Todas categorias</option>
            {categorias.map(cat => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
          </select>
          <button onClick={() => setFilterEstoqueBaixo(!filterEstoqueBaixo)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${filterEstoqueBaixo ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <AlertTriangle className="w-4 h-4" /> Estoque baixo
          </button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 opacity-90 rounded-xl border border-slate-200 dark:border-slate-700 sm:ml-auto">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Visualização em Grade">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`} title="Visualização em Lista">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (<div className="p-12 text-center text-slate-400 dark:text-slate-500">Carregando...</div>) : produtos.length === 0 ? (
          <EmptyState icon={filterEstoqueBaixo ? 'alert' : 'package'} title={filterEstoqueBaixo ? 'Nenhum produto com estoque baixo' : 'Nenhum produto encontrado'} />
        ) : (
          viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preço</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estoque</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {produtos.map(produto => {
                  const estoqueBaixo = produto.quantidade <= produto.quantidade_minima;
                  return (
                    <tr key={produto.id} onClick={() => setSelectedProductId(produto.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{produto.nome}</p>
                        {produto.codigo_barras && (<p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{produto.codigo_barras}</p>)}
                      </td>
                      <td className="px-6 py-3.5"><StatusBadge variant="neutral">{(produto as any).categoria?.nome || '-'}</StatusBadge></td>
                      <td className="px-6 py-3.5 text-right font-medium text-slate-900 dark:text-slate-100">R$ {Number(produto.preco).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center"><StatusBadge variant={estoqueBaixo ? 'danger' : 'success'}>{produto.quantidade} un.</StatusBadge></td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setEditingProduto(produto); setShowModal(true); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(produto.id); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50">
            {produtos.map(produto => {
              const estoqueBaixo = produto.quantidade <= produto.quantidade_minima;
              return (
                <div key={produto.id} onClick={() => setSelectedProductId(produto.id)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center group">
                    {produto.imagem_url ? (
                        <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 transition-transform group-hover:scale-110" />
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge variant={estoqueBaixo ? 'danger' : 'success'}>{produto.quantidade} un.</StatusBadge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1" title={produto.nome}>{produto.nome}</h3>
                      <div className="flex items-center justify-between mt-1 h-5">
                        {produto.codigo_barras ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate mr-2">{produto.codigo_barras}</p>
                        ) : <div />}
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full whitespace-nowrap">{(produto as any).categoria?.nome || 'Sem categoria'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-lg text-slate-900 dark:text-slate-100">R$ {Number(produto.preco).toFixed(2)}</p>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingProduto(produto); setShowModal(true); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(produto.id); }} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
        )}
      </div>

      {showModal && (<ProductModal produto={editingProduto} categorias={categorias} onSave={handleSave} onClose={() => { setShowModal(false); setEditingProduto(null); }} />)}
      
      <ProductDetailModal produtoId={selectedProductId} onClose={() => setSelectedProductId(null)} />
    </div>
  );
}
