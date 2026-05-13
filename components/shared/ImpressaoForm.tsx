'use client';

import { useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { criarImpressao } from '@/app/actions/impressao';
import type { SiteConfig, TipoImpressao } from '@/types';
import {
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Store,
  X,
} from 'lucide-react';

interface Props {
  config: SiteConfig;
  tipos: TipoImpressao[];
}

const MIME_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const TAMANHO_MAX = 20 * 1024 * 1024;

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function sanitizeNome(nome: string) {
  return nome.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

export default function ImpressaoForm({ config, tipos }: Props) {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [tipoId, setTipoId] = useState<string>(tipos[0]?.id ?? '');
  const [modoCor, setModoCor] = useState<'pb' | 'colorida'>('pb');
  const [folhas, setFolhas] = useState<number>(1);
  const [observacoes, setObservacoes] = useState('');

  const podeOnline = config.pagamento_online_ativo;
  const podeRetirada = config.retirada_local_ativa;
  const [tipoPagamento, setTipoPagamento] = useState<'online' | 'retirada_local'>(
    podeOnline ? 'online' : 'retirada_local'
  );

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploadingArquivo, setUploadingArquivo] = useState(false);
  const [arquivoPath, setArquivoPath] = useState<string | null>(null);
  const [arquivoErro, setArquivoErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<{ numero: number; url?: string | null } | null>(null);

  const precoUnitario =
    modoCor === 'pb'
      ? config.impressao_preco_pb_centavos
      : config.impressao_preco_colorida_centavos;
  const total = useMemo(() => precoUnitario * Math.max(0, folhas), [precoUnitario, folhas]);

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoErro(null);
    if (!MIME_PERMITIDOS.includes(file.type)) {
      setArquivoErro('Formato não suportado. Use PDF, JPG, PNG, DOC ou DOCX.');
      return;
    }
    if (file.size > TAMANHO_MAX) {
      setArquivoErro('Arquivo muito grande. Máximo 20MB.');
      return;
    }

    setArquivo(file);
    setUploadingArquivo(true);
    try {
      const supabase = createClient();
      const path = `${Date.now()}_${sanitizeNome(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from('impressoes')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
      if (upErr) throw upErr;
      setArquivoPath(path);
    } catch (err: any) {
      console.error('[impressao] upload:', err);
      setArquivoErro(err.message || 'Erro ao enviar arquivo.');
      setArquivo(null);
    } finally {
      setUploadingArquivo(false);
    }
  };

  const removerArquivo = () => {
    setArquivo(null);
    setArquivoPath(null);
    setArquivoErro(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroGeral(null);

    if (!arquivoPath) {
      setErroGeral('Envie o arquivo antes de continuar.');
      return;
    }
    if (folhas <= 0) {
      setErroGeral('Quantidade de folhas inválida.');
      return;
    }

    setEnviando(true);
    try {
      const r = await criarImpressao({
        cliente: { nome, whatsapp, email: email || undefined },
        tipo_impressao_id: tipoId,
        modo_cor: modoCor,
        quantidade_folhas: folhas,
        arquivo_path: arquivoPath,
        arquivo_nome: arquivo?.name,
        observacoes: observacoes || undefined,
        tipo_pagamento: tipoPagamento,
      });

      if (!r.success) {
        setErroGeral(r.error || 'Erro ao criar pedido.');
        setEnviando(false);
        return;
      }

      if (r.checkout_url) {
        window.location.href = r.checkout_url;
        return;
      }

      setSucesso({ numero: r.impressao_numero!, url: r.checkout_url });
    } catch (err: any) {
      setErroGeral(err.message || 'Erro inesperado.');
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Pedido criado!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Seu pedido <strong>#{String(sucesso.numero).padStart(4, '0')}</strong> foi registrado.{' '}
          {tipoPagamento === 'retirada_local'
            ? 'Pague ao retirar na banca.'
            : 'Aguarde a confirmação do pagamento.'}
        </p>
        <a
          href="/"
          className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold"
        >
          Voltar ao site
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submeter}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5"
    >
      {/* Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nome *
          </label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            WhatsApp *
          </label>
          <input
            type="tel"
            required
            placeholder="(11) 91234-5678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            E-mail (opcional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tipo + modo + folhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tipo de impressão *
          </label>
          <select
            required
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icone ? `${t.icone} ` : ''}
                {t.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Folhas *
          </label>
          <input
            type="number"
            required
            min={1}
            value={folhas}
            onChange={(e) => setFolhas(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 tabular-nums"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Modo de impressão *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['pb', 'colorida'] as const).map((m) => {
            const ativo = modoCor === m;
            const preco =
              m === 'pb'
                ? config.impressao_preco_pb_centavos
                : config.impressao_preco_colorida_centavos;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setModoCor(m)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  ativo
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {m === 'pb' ? 'Preto e branco' : 'Colorida'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {fmtBRL(preco)} / folha
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Arquivo */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Arquivo * <span className="text-slate-400">(PDF, JPG, PNG, DOC, DOCX — máx 20MB)</span>
        </label>

        {arquivo ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {arquivo.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {uploadingArquivo
                  ? 'Enviando...'
                  : arquivoPath
                  ? 'Pronto'
                  : 'Aguardando...'}
              </p>
            </div>
            {uploadingArquivo ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <button
                type="button"
                onClick={removerArquivo}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Selecionar arquivo
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleArquivo}
          className="hidden"
        />

        {arquivoErro && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{arquivoErro}</p>
        )}
      </div>

      {/* Observações */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Observações (opcional)
        </label>
        <textarea
          rows={2}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Ex.: imprimir frente e verso, grampear..."
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Pagamento */}
      {(podeOnline || podeRetirada) && (
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Forma de pagamento *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {podeOnline && (
              <button
                type="button"
                onClick={() => setTipoPagamento('online')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  tipoPagamento === 'online'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Pagar online
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cartão via SumUp
                  </p>
                </div>
              </button>
            )}
            {podeRetirada && (
              <button
                type="button"
                onClick={() => setTipoPagamento('retirada_local')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  tipoPagamento === 'retirada_local'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Pagar na banca
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ao retirar
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            Total
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {folhas} × {fmtBRL(precoUnitario)}
          </p>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {fmtBRL(total)}
        </p>
      </div>

      {erroGeral && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{erroGeral}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={enviando || uploadingArquivo || !arquivoPath}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {enviando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : tipoPagamento === 'online' ? (
          'Continuar para pagamento'
        ) : (
          'Confirmar pedido'
        )}
      </button>
    </form>
  );
}
