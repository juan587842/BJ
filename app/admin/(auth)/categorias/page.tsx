'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Categoria } from '@/types';
import { Plus, Edit2, Trash2, X, FolderOpen } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function CategoriasPage() {
  const supabase = createClient();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [icone, setIcone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*').order('nome');
    if (data) setCategorias(data);
  };

  useEffect(() => { fetchCategorias(); }, []);

  const openModal = (cat?: Categoria) => {
    if (cat) {
      setEditingCategoria(cat);
      setNome(cat.nome);
      setDescricao(cat.descricao || '');
      setIcone(cat.icone || '');
    } else {
      setEditingCategoria(null);
      setNome('');
      setDescricao('');
      setIcone('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { nome, descricao: descricao || null, icone: icone || null };
    let error;
    if (editingCategoria) {
      ({ error } = await (supabase as any).from('categorias').update(data).eq('id', editingCategoria.id));
    } else {
      ({ error } = await (supabase as any).from('categorias').insert(data));
    }
    setSaving(false);
    if (!error) { setShowModal(false); fetchCategorias(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return;
    await supabase.from('categorias').delete().eq('id', id);
    fetchCategorias();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Categorias</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{categorias.length} categoria{categorias.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="card">
        {categorias.length === 0 ? (
          <EmptyState icon="package" title="Nenhuma categoria cadastrada" description="Crie categorias para organizar seus produtos."
            action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Criar primeira categoria</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
            {categorias.map(cat => (
              <div key={cat.id} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl text-lg">
                      {cat.icone || <FolderOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.nome}</p>
                      {cat.descricao && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{cat.descricao}</p>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(cat)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="input-field" placeholder="Ex: Revistas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="input-field resize-none" placeholder="Descrição opcional..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ícone (emoji)</label>
                <input type="text" value={icone} onChange={(e) => setIcone(e.target.value)} className="input-field" placeholder="📰" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
