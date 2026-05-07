'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.55,
  },
  nome: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  contato: { fontSize: 9.5, color: '#6b7280', marginBottom: 2 },
  divisor: { borderBottomWidth: 0.5, borderBottomColor: '#d1d5db', marginVertical: 14 },
  secao: { marginBottom: 12 },
  secaoTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  itemLinha: { marginBottom: 8 },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  itemTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
  itemPeriodo: { fontSize: 9, color: '#9ca3af' },
  itemSub: { fontSize: 9.5, color: '#4b5563', marginBottom: 3 },
  texto: { fontSize: 9.5, color: '#374151' },
  idiomaLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
});

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

export default function MinimalistaTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  const linha1 = [c.dados.email, c.dados.telefone].filter(Boolean).join('  ·  ');
  const linha2 = [
    [c.dados.cidade, c.dados.estado].filter(Boolean).join(' / '),
    c.dados.endereco,
  ].filter(Boolean).join('  ·  ');
  const linha3 = [
    c.dados.dataNascimento && `Nascimento ${c.dados.dataNascimento}`,
    c.dados.estadoCivil,
    c.dados.cpf && `CPF ${c.dados.cpf}`,
  ].filter(Boolean).join('  ·  ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
        {linha1 ? <Text style={styles.contato}>{linha1}</Text> : null}
        {linha2 ? <Text style={styles.contato}>{linha2}</Text> : null}
        {linha3 ? <Text style={styles.contato}>{linha3}</Text> : null}

        <View style={styles.divisor} />

        {c.objetivo ? (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Objetivo</Text>
            <Text style={styles.texto}>{c.objetivo}</Text>
          </View>
        ) : null}

        {c.experiencias.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Experiência</Text>
            {c.experiencias.map((e, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
                  <Text style={styles.itemTitulo}>{e.cargo || 'Cargo'} — {e.empresa || 'Empresa'}</Text>
                  <Text style={styles.itemPeriodo}>{periodo(e.inicio, e.fim, e.atual)}</Text>
                </View>
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
            <Text style={styles.secaoTitulo}>Cursos</Text>
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
            <Text style={styles.secaoTitulo}>Idiomas</Text>
            {c.idiomas.map((idioma, i) => (
              <View key={i} style={styles.idiomaLinha}>
                <Text style={styles.texto}>{idioma.nome}</Text>
                <Text style={styles.itemPeriodo}>{idioma.nivel}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
