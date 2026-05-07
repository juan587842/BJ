'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const INK = '#1a1a1a';
const ACCENT = '#7a2828';
const MUTED = '#666666';
const LINE = '#c9b896';

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 70,
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    color: INK,
    lineHeight: 1.6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  nome: {
    fontFamily: 'Times-Bold',
    fontSize: 28,
    letterSpacing: 4,
    color: INK,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ornamento: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ornamentoLinha: { width: 60, height: 0.8, backgroundColor: LINE },
  ornamentoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: ACCENT, marginHorizontal: 8 },
  contato: {
    fontSize: 9.5,
    color: MUTED,
    fontFamily: 'Times-Italic',
    textAlign: 'center',
    marginBottom: 3,
  },
  secao: { marginBottom: 22 },
  secaoTituloWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  secaoTitulo: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginRight: 12,
  },
  secaoLinha: { flex: 1, height: 0.8, backgroundColor: LINE },
  itemLinha: { marginBottom: 14 },
  itemTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  itemTitulo: { fontFamily: 'Times-Bold', fontSize: 11.5, color: INK },
  itemPeriodo: { fontSize: 9.5, color: MUTED, fontFamily: 'Times-Italic' },
  itemSub: { fontSize: 10, fontFamily: 'Times-Italic', color: ACCENT, marginBottom: 5 },
  texto: { fontSize: 10, color: '#333333', lineHeight: 1.55 },
  objetivoTexto: {
    fontSize: 10.5,
    fontFamily: 'Times-Italic',
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 1.7,
  },
  idiomaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8dfd0',
  },
  idiomaNome: { fontFamily: 'Times-Bold', fontSize: 10.5 },
  idiomaNivel: { fontSize: 10, color: MUTED, fontFamily: 'Times-Italic' },
});

function montarContato(c: Curriculo) {
  return [
    c.dados.email,
    c.dados.telefone,
    [c.dados.cidade, c.dados.estado].filter(Boolean).join(' / '),
  ].filter(Boolean).join('  ·  ');
}

function montarContatoSecundario(c: Curriculo) {
  return [
    c.dados.endereco,
    c.dados.dataNascimento && `Nascimento: ${c.dados.dataNascimento}`,
    c.dados.estadoCivil,
    c.dados.cpf && `CPF: ${c.dados.cpf}`,
  ].filter(Boolean).join('  ·  ');
}

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

function SecaoTitulo({ titulo }: { titulo: string }) {
  return (
    <View style={styles.secaoTituloWrap}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      <View style={styles.secaoLinha} />
    </View>
  );
}

export default function ClassicoTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  const contato1 = montarContato(c);
  const contato2 = montarContatoSecundario(c);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
          <View style={styles.ornamento}>
            <View style={styles.ornamentoLinha} />
            <View style={styles.ornamentoDot} />
            <View style={styles.ornamentoLinha} />
          </View>
          {contato1 ? <Text style={styles.contato}>{contato1}</Text> : null}
          {contato2 ? <Text style={styles.contato}>{contato2}</Text> : null}
        </View>

        {c.objetivo ? (
          <View style={styles.secao}>
            <Text style={styles.objetivoTexto}>“{c.objetivo}”</Text>
          </View>
        ) : null}

        {c.experiencias.length > 0 && (
          <View style={styles.secao}>
            <SecaoTitulo titulo="Experiência" />
            {c.experiencias.map((e, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
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
            <SecaoTitulo titulo="Formação" />
            {c.formacoes.map((f, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
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
            <SecaoTitulo titulo="Cursos" />
            {c.cursos.map((curso, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
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
            <SecaoTitulo titulo="Idiomas" />
            {c.idiomas.map((idioma, i) => (
              <View key={i} style={styles.idiomaLinha}>
                <Text style={styles.idiomaNome}>{idioma.nome}</Text>
                <Text style={styles.idiomaNivel}>{idioma.nivel}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
