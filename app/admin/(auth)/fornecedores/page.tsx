'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Fornecedor } from '@/types';
import { Plus, Edit2, Trash2, X, Truck } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function FornecedoresPage() {
  const supabase = createClient();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetch = async () => {
    const { data } = await supabase.from('fornecedores').select('*').order('nome');
    if (data) setFornecedores(data as Fornecedor[]);
  };

  useEffect(() => { fetch(); }, []);

  const open = (f?: Fornecedor) => {
    if (f) {
      setEditing(f); setNome(f.nome); setContato(f.contato || ''); setObservacoes(f.observacoes || '');
    } else {
      setEditing(null); setNome(''); setContato(''); setObservacoes('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { nome, contato: contato || null, observacoes: observacoes || null };
    let error;
    if (editing) {
      ({ error } = await (supabase as any).from('fornecedores').update(data).eq('id', editing.id));
    } else {
      ({ error } = await (supabase as any).from('fornecedores').insert(data));
    }
    setSaving(false);
    if (!error) { setShowModal(false); fetch(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este fornecedor? Não será possível se houver consignações vinculadas.')) return;
    setDeleteError('');
    const { error } = await supabase.from('fornecedores').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        setDeleteError('Não é possível excluir este fornecedor pois existem consignações vinculadas.');
      } else {
        setDeleteError('Erro ao excluir fornecedor.');
      }
      return;
    }
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Fornecedores</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{fornecedores.length} fornecedor{fornecedores.length !== 1 ? 'es' : ''}</p>
        </div>
        <button onClick={() => open()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-2">&times;</button>
        </div>
      )}

      <div className="card">
        {fornecedores.length === 0 ? (
          <EmptyState icon="package" title="Nenhum fornecedor cadastrado" description="Cadastre fornecedores para gerenciar consignações."
            action={<button onClick={() => open()} className="btn-primary"><Plus className="w-4 h-4" /> Cadastrar primeiro</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
            {fornecedores.map(f => (
              <div key={f.id} className="group border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <Truck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{f.nome}</p>
                      {f.contato && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{f.contato}</p>}
                      {f.observacoes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{f.observacoes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => open(f)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="input-field" placeholder="Ex: Editora ABC" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contato</label>
                <input type="text" value={contato} onChange={(e) => setContato(e.target.value)} className="input-field" placeholder="WhatsApp / e-mail" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="input-field resize-none" />
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
