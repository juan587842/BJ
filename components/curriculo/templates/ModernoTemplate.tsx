'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Curriculo } from '@/types/curriculo';

const PRIMARY = '#4f46e5';
const DARK = '#1e293b';
const MUTED = '#64748b';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK,
    lineHeight: 1.45,
  },
  sidebar: {
    width: '34%',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    padding: 24,
  },
  sidebarTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 3,
  },
  sidebarTexto: { fontSize: 9, color: '#cbd5e1', marginBottom: 4 },
  sidebarLabel: { fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 },
  main: { flex: 1, padding: 28 },
  nome: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  cargoTopo: { fontSize: 11, color: PRIMARY, marginBottom: 14, fontFamily: 'Helvetica-Bold' },
  secao: { marginBottom: 14 },
  secaoTitulo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  itemLinha: { marginBottom: 9, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#e0e7ff' },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  itemTitulo: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: DARK },
  itemPeriodo: { fontSize: 9, color: MUTED },
  itemSub: { fontSize: 9, color: PRIMARY, marginBottom: 3 },
  texto: { fontSize: 9.5, color: '#334155' },
  idiomaLinha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
});

function periodo(inicio: string, fim: string, atual?: boolean) {
  if (!inicio && !fim) return '';
  return `${inicio || '?'} — ${atual ? 'Atual' : (fim || '?')}`;
}

export default function ModernoTemplate({ curriculo }: { curriculo: Curriculo }) {
  const c = curriculo;
  const cargoTopo = c.experiencias[0]?.cargo || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.nome}>{c.dados.nome || 'Seu Nome'}</Text>
          {cargoTopo ? <Text style={styles.cargoTopo}>{cargoTopo}</Text> : null}

          <Text style={styles.sidebarTitulo}>Contato</Text>
          {c.dados.email ? (<><Text style={styles.sidebarLabel}>Email</Text><Text style={styles.sidebarTexto}>{c.dados.email}</Text></>) : null}
          {c.dados.telefone ? (<><Text style={styles.sidebarLabel}>Telefone</Text><Text style={styles.sidebarTexto}>{c.dados.telefone}</Text></>) : null}
          {(c.dados.cidade || c.dados.estado) ? (<><Text style={styles.sidebarLabel}>Localidade</Text><Text style={styles.sidebarTexto}>{[c.dados.cidade, c.dados.estado].filter(Boolean).join(' / ')}</Text></>) : null}
          {c.dados.endereco ? (<><Text style={styles.sidebarLabel}>Endereço</Text><Text style={styles.sidebarTexto}>{c.dados.endereco}</Text></>) : null}

          {(c.dados.dataNascimento || c.dados.estadoCivil || c.dados.cpf) && (
            <>
              <Text style={styles.sidebarTitulo}>Dados</Text>
              {c.dados.dataNascimento ? (<><Text style={styles.sidebarLabel}>Nascimento</Text><Text style={styles.sidebarTexto}>{c.dados.dataNascimento}</Text></>) : null}
              {c.dados.estadoCivil ? (<><Text style={styles.sidebarLabel}>Estado civil</Text><Text style={styles.sidebarTexto}>{c.dados.estadoCivil}</Text></>) : null}
              {c.dados.cpf ? (<><Text style={styles.sidebarLabel}>CPF</Text><Text style={styles.sidebarTexto}>{c.dados.cpf}</Text></>) : null}
            </>
          )}

          {c.idiomas.length > 0 && (
            <>
              <Text style={styles.sidebarTitulo}>Idiomas</Text>
              {c.idiomas.map((idioma, i) => (
                <View key={i} style={styles.idiomaLinha}>
                  <Text style={styles.sidebarTexto}>{idioma.nome}</Text>
                  <Text style={styles.sidebarTexto}>{idioma.nivel}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Main */}
        <View style={styles.main}>
          {c.objetivo ? (
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Perfil</Text>
              <Text style={styles.texto}>{c.objetivo}</Text>
            </View>
          ) : null}

          {c.experiencias.length > 0 && (
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Experiência</Text>
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
              <Text style={styles.secaoTitulo}>Formação</Text>
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
              <Text style={styles.secaoTitulo}>Cursos</Text>
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
        </View>
      </Page>
    </Document>
  );
}
