'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#1f2937',
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1f2937',
    paddingBottom: 12,
    marginBottom: 16,
  },
  nome: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    letterSpacing: 1,
    marginBottom: 6,
  },
  contato: {
    fontSize: 10,
    color: '#374151',
  },
  secao: { marginTop: 14 },
  secaoTitulo: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    paddingBottom: 3,
    marginBottom: 8,
  },
  itemLinha: { marginBottom: 8 },
  itemTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitulo: { fontFamily: 'Times-Bold', fontSize: 11 },
  itemPeriodo: { fontSize: 10, color: '#6b7280' },
  itemSub: { fontSize: 10, fontStyle: 'italic', marginBottom: 3 },
  texto: { fontSize: 10 },
  idiomaLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
});

function montarContato(c: Curriculo) {
  const partes = [
    c.dados.email,
    c.dados.telefone,
    [c.dados.cidade, c.dados.estado].filter(Boolean).join(' / '),
    c.dados.endereco,
  ].filter(Boolean);
  return partes.join('  •  ');
}

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

export default function ClassicoTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
          <Text style={styles.contato}>{montarContato(c)}</Text>
          {(c.dados.dataNascimento || c.dados.estadoCivil || c.dados.cpf) && (
            <Text style={styles.contato}>
              {[
                c.dados.dataNascimento && `Nascimento: ${c.dados.dataNascimento}`,
                c.dados.estadoCivil,
                c.dados.cpf && `CPF: ${c.dados.cpf}`,
              ].filter(Boolean).join('  •  ')}
            </Text>
          )}
        </View>

        {c.objetivo ? (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Objetivo</Text>
            <Text style={styles.texto}>{c.objetivo}</Text>
          </View>
        ) : null}

        {c.experiencias.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Experiência Profissional</Text>
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
            <Text style={styles.secaoTitulo}>Formação Acadêmica</Text>
            {c.formacoes.map((f, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
                  <Text style={styles.itemTitulo}>{f.curso || f.nivel || 'Curso'}</Text>
                  <Text style={styles.itemPeriodo}>{periodo(f.inicio, f.fim)}</Text>
                </View>
                <Text style={styles.itemSub}>
                  {[f.instituicao, f.nivel, f.status].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {c.cursos.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Cursos Complementares</Text>
            {c.cursos.map((curso, i) => (
              <View key={i} style={styles.itemLinha} wrap={false}>
                <View style={styles.itemTopo}>
                  <Text style={styles.itemTitulo}>{curso.nome || 'Curso'}</Text>
                  <Text style={styles.itemPeriodo}>{curso.ano}</Text>
                </View>
                <Text style={styles.itemSub}>
                  {[curso.instituicao, curso.cargaHoraria && `${curso.cargaHoraria}h`].filter(Boolean).join(' • ')}
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
                <Text style={styles.texto}>{idioma.nivel}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
