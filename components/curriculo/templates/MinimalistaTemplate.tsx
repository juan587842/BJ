'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const INK = '#0a0a0a';
const MUTED = '#737373';
const FAINT = '#a3a3a3';
const ACCENT = '#000000';

const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 80,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK,
    lineHeight: 1.65,
  },
  header: { marginBottom: 36 },
  nome: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    letterSpacing: -1.2,
    color: ACCENT,
    marginBottom: 14,
  },
  contatoBloco: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  contatoItem: { flexDirection: 'row', alignItems: 'baseline' },
  contatoLabel: {
    fontSize: 7.5,
    color: FAINT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginRight: 5,
  },
  contatoValor: { fontSize: 10, color: INK },

  secao: { marginBottom: 28 },
  secaoTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: FAINT,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },

  objetivoTexto: {
    fontSize: 12,
    color: INK,
    lineHeight: 1.6,
    fontFamily: 'Helvetica',
  },

  itemLinha: { marginBottom: 18 },
  itemTopoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  itemTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 11.5, color: ACCENT },
  itemPeriodo: { fontSize: 9, color: FAINT },
  itemSub: { fontSize: 10, color: MUTED, marginBottom: 6 },
  texto: { fontSize: 10, color: '#404040', lineHeight: 1.6 },

  idiomaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  idiomaItem: { marginBottom: 6 },
  idiomaNome: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, color: ACCENT },
  idiomaNivel: { fontSize: 9, color: MUTED },
});

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

function ContatoItem({ label, valor }: { label: string; valor: string }) {
  if (!valor) return null;
  return (
    <View style={styles.contatoItem}>
      <Text style={styles.contatoLabel}>{label}</Text>
      <Text style={styles.contatoValor}>{valor}</Text>
    </View>
  );
}

export default function MinimalistaTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  const localidade = [c.dados.cidade, c.dados.estado].filter(Boolean).join(' / ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
          <View style={styles.contatoBloco}>
            <ContatoItem label="Email" valor={c.dados.email} />
            <ContatoItem label="Tel" valor={c.dados.telefone} />
            <ContatoItem label="Local" valor={localidade} />
            <ContatoItem label="Nasc" valor={c.dados.dataNascimento} />
          </View>
        </View>

        {c.objetivo ? (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Sobre</Text>
            <Text style={styles.objetivoTexto}>{c.objetivo}</Text>
          </View>
        ) : null}

        {c.experiencias.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Experiência</Text>
            {c.experiencias.map((e, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopoLinha}>
                  <Text style={styles.itemTitulo}>{e.cargo || 'Cargo'}</Text>
                  <Text style={styles.itemPeriodo}>{periodo(e.inicio, e.fim, e.atual)}</Text>
                </View>
                <Text style={styles.itemSub}>{e.empresa}</Text>
                {e.descricao ? <Text style={styles.texto}>{e.descricao}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {c.formacoes.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Formação</Text>
            {c.formacoes.map((f, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopoLinha}>
                  <Text style={styles.itemTitulo}>{f.curso || f.nivel || 'Curso'}</Text>
                  <Text style={styles.itemPeriodo}>{periodo(f.inicio, f.fim)}</Text>
                </View>
                <Text style={styles.itemSub}>
                  {[f.instituicao, f.nivel, f.status].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {c.cursos.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Cursos</Text>
            {c.cursos.map((curso, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopoLinha}>
                  <Text style={styles.itemTitulo}>{curso.nome || 'Curso'}</Text>
                  <Text style={styles.itemPeriodo}>{curso.ano}</Text>
                </View>
                <Text style={styles.itemSub}>
                  {[curso.instituicao, curso.cargaHoraria && `${curso.cargaHoraria}h`].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {c.idiomas.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Idiomas</Text>
            <View style={styles.idiomaGrid}>
              {c.idiomas.map((idioma, i) => (
                <View key={i} style={styles.idiomaItem}>
                  <Text style={styles.idiomaNome}>{idioma.nome}</Text>
                  <Text style={styles.idiomaNivel}>{idioma.nivel}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
