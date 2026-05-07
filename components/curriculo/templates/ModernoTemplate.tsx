'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const TEAL = '#0d7c7c';
const TEAL_DARK = '#0a5f5f';
const SAND = '#f5f1ea';
const INK = '#2a2a2a';
const MUTED = '#6b6b6b';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK,
    lineHeight: 1.55,
  },
  sidebar: {
    width: '36%',
    backgroundColor: SAND,
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  nomeBloco: { marginBottom: 32 },
  nome: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    color: TEAL_DARK,
    lineHeight: 1.15,
    marginBottom: 6,
  },
  cargoTopo: {
    fontSize: 10.5,
    color: TEAL,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  sidebarSecao: { marginBottom: 26 },
  sidebarTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: TEAL_DARK,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  sidebarItem: { marginBottom: 8 },
  sidebarLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 1,
  },
  sidebarTexto: { fontSize: 9.5, color: INK },

  main: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 36,
    backgroundColor: '#ffffff',
  },
  secao: { marginBottom: 24 },
  secaoTituloWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  secaoBarra: { width: 4, height: 18, backgroundColor: TEAL, marginRight: 10 },
  secaoTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: TEAL_DARK,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  itemLinha: { marginBottom: 14, paddingBottom: 4 },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  itemTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: INK },
  itemPeriodo: { fontSize: 9, color: MUTED },
  itemSub: { fontSize: 10, color: TEAL, fontFamily: 'Helvetica-Bold', marginBottom: 5 },
  texto: { fontSize: 9.5, color: '#3d3d3d', lineHeight: 1.55 },

  objetivoTexto: { fontSize: 10, color: '#3d3d3d', lineHeight: 1.65 },
  idiomaLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  idiomaBarras: { flexDirection: 'row', gap: 2 },
  idiomaPill: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },
  idiomaPillVazio: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d4cdbe' },
});

const NIVEL_PONTOS: Record<string, number> = {
  'Básico': 1, 'Intermediário': 2, 'Avançado': 3, 'Fluente': 4, 'Nativo': 5,
};

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

function SecaoTitulo({ titulo }: { titulo: string }) {
  return (
    <View style={styles.secaoTituloWrap}>
      <View style={styles.secaoBarra} />
      <Text style={styles.secaoTitulo}>{titulo}</Text>
    </View>
  );
}

export default function ModernoTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  const cargoTopo = c.experiencias[0]?.cargo || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>
          <View style={styles.nomeBloco}>
            <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
            {cargoTopo ? <Text style={styles.cargoTopo}>{cargoTopo}</Text> : null}
          </View>

          <View style={styles.sidebarSecao}>
            <Text style={styles.sidebarTitulo}>Contato</Text>
            {c.dados.email ? (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Email</Text>
                <Text style={styles.sidebarTexto}>{c.dados.email}</Text>
              </View>
            ) : null}
            {c.dados.telefone ? (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Telefone</Text>
                <Text style={styles.sidebarTexto}>{c.dados.telefone}</Text>
              </View>
            ) : null}
            {(c.dados.cidade || c.dados.estado) ? (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Localidade</Text>
                <Text style={styles.sidebarTexto}>{[c.dados.cidade, c.dados.estado].filter(Boolean).join(' / ')}</Text>
              </View>
            ) : null}
            {c.dados.endereco ? (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarLabel}>Endereço</Text>
                <Text style={styles.sidebarTexto}>{c.dados.endereco}</Text>
              </View>
            ) : null}
          </View>

          {(c.dados.dataNascimento || c.dados.estadoCivil || c.dados.cpf) ? (
            <View style={styles.sidebarSecao}>
              <Text style={styles.sidebarTitulo}>Dados Pessoais</Text>
              {c.dados.dataNascimento ? (
                <View style={styles.sidebarItem}>
                  <Text style={styles.sidebarLabel}>Nascimento</Text>
                  <Text style={styles.sidebarTexto}>{c.dados.dataNascimento}</Text>
                </View>
              ) : null}
              {c.dados.estadoCivil ? (
                <View style={styles.sidebarItem}>
                  <Text style={styles.sidebarLabel}>Estado civil</Text>
                  <Text style={styles.sidebarTexto}>{c.dados.estadoCivil}</Text>
                </View>
              ) : null}
              {c.dados.cpf ? (
                <View style={styles.sidebarItem}>
                  <Text style={styles.sidebarLabel}>CPF</Text>
                  <Text style={styles.sidebarTexto}>{c.dados.cpf}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {c.idiomas.length > 0 && (
            <View style={styles.sidebarSecao}>
              <Text style={styles.sidebarTitulo}>Idiomas</Text>
              {c.idiomas.map((idioma, i) => {
                const pontos = NIVEL_PONTOS[idioma.nivel] ?? 0;
                return (
                  <View key={i} style={styles.idiomaLinha}>
                    <Text style={styles.sidebarTexto}>{idioma.nome}</Text>
                    <View style={styles.idiomaBarras}>
                      {[1,2,3,4,5].map((n) => (
                        <View key={n} style={n <= pontos ? styles.idiomaPill : styles.idiomaPillVazio} />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.main}>
          {c.objetivo ? (
            <View style={styles.secao}>
              <SecaoTitulo titulo="Perfil" />
              <Text style={styles.objetivoTexto}>{c.objetivo}</Text>
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
        </View>
      </Page>
    </Document>
  );
}
