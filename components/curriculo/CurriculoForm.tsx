'use client';

import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Curriculo, Experiencia, Formacao, Curso, Idioma } from '@/types/curriculo';

interface Props {
  curriculo: Curriculo;
  setCurriculo: (c: Curriculo) => void;
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

function Secao({ titulo, children, defaultOpen = true }: { titulo: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [aberta, setAberta] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
      <button
        type="button"
        onClick={() => setAberta(!aberta)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100"
      >
        {titulo}
        {aberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {aberta && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function BotaoAdicionar({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function BotaoRemover({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 text-slate-400 hover:text-red-500 transition"
      title="Remover"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export default function CurriculoForm({ curriculo, setCurriculo }: Props) {
  const c = curriculo;

  const setDados = (k: keyof typeof c.dados, v: string) =>
    setCurriculo({ ...c, dados: { ...c.dados, [k]: v } });

  // Experiência
  const addExperiencia = () =>
    setCurriculo({
      ...c,
      experiencias: [...c.experiencias, { empresa: '', cargo: '', inicio: '', fim: '', atual: false, descricao: '' }],
    });
  const setExperiencia = (i: number, patch: Partial<Experiencia>) =>
    setCurriculo({
      ...c,
      experiencias: c.experiencias.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    });
  const removeExperiencia = (i: number) =>
    setCurriculo({ ...c, experiencias: c.experiencias.filter((_, idx) => idx !== i) });

  // Formação
  const addFormacao = () =>
    setCurriculo({
      ...c,
      formacoes: [...c.formacoes, { instituicao: '', curso: '', nivel: '', inicio: '', fim: '', status: '' }],
    });
  const setFormacao = (i: number, patch: Partial<Formacao>) =>
    setCurriculo({
      ...c,
      formacoes: c.formacoes.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    });
  const removeFormacao = (i: number) =>
    setCurriculo({ ...c, formacoes: c.formacoes.filter((_, idx) => idx !== i) });

  // Cursos
  const addCurso = () =>
    setCurriculo({ ...c, cursos: [...c.cursos, { nome: '', instituicao: '', cargaHoraria: '', ano: '' }] });
  const setCurso = (i: number, patch: Partial<Curso>) =>
    setCurriculo({ ...c, cursos: c.cursos.map((cu, idx) => (idx === i ? { ...cu, ...patch } : cu)) });
  const removeCurso = (i: number) =>
    setCurriculo({ ...c, cursos: c.cursos.filter((_, idx) => idx !== i) });

  // Idiomas
  const addIdioma = () => setCurriculo({ ...c, idiomas: [...c.idiomas, { nome: '', nivel: 'Básico' }] });
  const setIdioma = (i: number, patch: Partial<Idioma>) =>
    setCurriculo({ ...c, idiomas: c.idiomas.map((id, idx) => (idx === i ? { ...id, ...patch } : id)) });
  const removeIdioma = (i: number) =>
    setCurriculo({ ...c, idiomas: c.idiomas.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <Secao titulo="Dados Pessoais">
        <div>
          <label className={labelCls}>Nome completo</label>
          <input className={inputCls} value={c.dados.nome} onChange={(e) => setDados('nome', e.target.value)} placeholder="João da Silva" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} value={c.dados.email} onChange={(e) => setDados('email', e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input className={inputCls} value={c.dados.telefone} onChange={(e) => setDados('telefone', e.target.value)} placeholder="(11) 99999-9999" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Endereço</label>
          <input className={inputCls} value={c.dados.endereco} onChange={(e) => setDados('endereco', e.target.value)} placeholder="Rua, número, bairro" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Cidade</label>
            <input className={inputCls} value={c.dados.cidade} onChange={(e) => setDados('cidade', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Estado (UF)</label>
            <input className={inputCls} value={c.dados.estado} onChange={(e) => setDados('estado', e.target.value)} placeholder="SP" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Nascimento</label>
            <input className={inputCls} value={c.dados.dataNascimento} onChange={(e) => setDados('dataNascimento', e.target.value)} placeholder="01/01/1990" />
          </div>
          <div>
            <label className={labelCls}>Estado civil</label>
            <input className={inputCls} value={c.dados.estadoCivil} onChange={(e) => setDados('estadoCivil', e.target.value)} placeholder="Solteiro" />
          </div>
          <div>
            <label className={labelCls}>CPF</label>
            <input className={inputCls} value={c.dados.cpf} onChange={(e) => setDados('cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>
      </Secao>

      <Secao titulo="Objetivo Profissional">
        <textarea
          className={inputCls + ' min-h-[80px] resize-y'}
          value={c.objetivo}
          onChange={(e) => setCurriculo({ ...c, objetivo: e.target.value })}
          placeholder="Atuar como vendedor em ambiente dinâmico..."
        />
      </Secao>

      <Secao titulo="Experiência Profissional">
        {c.experiencias.map((exp, i) => (
          <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Experiência {i + 1}</span>
              <BotaoRemover onClick={() => removeExperiencia(i)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={exp.cargo} onChange={(e) => setExperiencia(i, { cargo: e.target.value })} placeholder="Cargo" />
              <input className={inputCls} value={exp.empresa} onChange={(e) => setExperiencia(i, { empresa: e.target.value })} placeholder="Empresa" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={exp.inicio} onChange={(e) => setExperiencia(i, { inicio: e.target.value })} placeholder="Início (Mês/Ano)" />
              <input
                className={inputCls}
                value={exp.fim}
                onChange={(e) => setExperiencia(i, { fim: e.target.value })}
                placeholder="Fim (Mês/Ano)"
                disabled={exp.atual}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={exp.atual}
                onChange={(e) => setExperiencia(i, { atual: e.target.checked, fim: e.target.checked ? '' : exp.fim })}
              />
              Trabalho atualmente aqui
            </label>
            <textarea
              className={inputCls + ' min-h-[60px] resize-y'}
              value={exp.descricao}
              onChange={(e) => setExperiencia(i, { descricao: e.target.value })}
              placeholder="Descrição das atividades"
            />
          </div>
        ))}
        <BotaoAdicionar onClick={addExperiencia} label="Adicionar experiência" />
      </Secao>

      <Secao titulo="Formação Acadêmica">
        {c.formacoes.map((f, i) => (
          <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Formação {i + 1}</span>
              <BotaoRemover onClick={() => removeFormacao(i)} />
            </div>
            <input className={inputCls} value={f.curso} onChange={(e) => setFormacao(i, { curso: e.target.value })} placeholder="Curso" />
            <input className={inputCls} value={f.instituicao} onChange={(e) => setFormacao(i, { instituicao: e.target.value })} placeholder="Instituição" />
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={f.nivel} onChange={(e) => setFormacao(i, { nivel: e.target.value })}>
                <option value="">Nível</option>
                <option>Ensino Fundamental</option>
                <option>Ensino Médio</option>
                <option>Técnico</option>
                <option>Graduação</option>
                <option>Pós-graduação</option>
                <option>Mestrado</option>
                <option>Doutorado</option>
              </select>
              <select className={inputCls} value={f.status} onChange={(e) => setFormacao(i, { status: e.target.value })}>
                <option value="">Status</option>
                <option>Concluído</option>
                <option>Cursando</option>
                <option>Trancado</option>
                <option>Incompleto</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={f.inicio} onChange={(e) => setFormacao(i, { inicio: e.target.value })} placeholder="Início" />
              <input className={inputCls} value={f.fim} onChange={(e) => setFormacao(i, { fim: e.target.value })} placeholder="Fim" />
            </div>
          </div>
        ))}
        <BotaoAdicionar onClick={addFormacao} label="Adicionar formação" />
      </Secao>

      <Secao titulo="Cursos Complementares" defaultOpen={false}>
        {c.cursos.map((cu, i) => (
          <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Curso {i + 1}</span>
              <BotaoRemover onClick={() => removeCurso(i)} />
            </div>
            <input className={inputCls} value={cu.nome} onChange={(e) => setCurso(i, { nome: e.target.value })} placeholder="Nome do curso" />
            <input className={inputCls} value={cu.instituicao} onChange={(e) => setCurso(i, { instituicao: e.target.value })} placeholder="Instituição" />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={cu.cargaHoraria} onChange={(e) => setCurso(i, { cargaHoraria: e.target.value })} placeholder="Carga horária" />
              <input className={inputCls} value={cu.ano} onChange={(e) => setCurso(i, { ano: e.target.value })} placeholder="Ano" />
            </div>
          </div>
        ))}
        <BotaoAdicionar onClick={addCurso} label="Adicionar curso" />
      </Secao>

      <Secao titulo="Idiomas" defaultOpen={false}>
        {c.idiomas.map((id, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input className={inputCls} value={id.nome} onChange={(e) => setIdioma(i, { nome: e.target.value })} placeholder="Idioma" />
            <select className={inputCls + ' w-40'} value={id.nivel} onChange={(e) => setIdioma(i, { nivel: e.target.value })}>
              <option>Básico</option>
              <option>Intermediário</option>
              <option>Avançado</option>
              <option>Fluente</option>
              <option>Nativo</option>
            </select>
            <BotaoRemover onClick={() => removeIdioma(i)} />
          </div>
        ))}
        <BotaoAdicionar onClick={addIdioma} label="Adicionar idioma" />
      </Secao>
    </div>
  );
}
