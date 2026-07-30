import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AvaliacaoCard } from '../../../src/components/avaliacoes/AvaliacaoCard';
import { MediasResumo } from '../../../src/components/avaliacoes/MediasResumo';
import type { AvaliacaoComMateria } from '../../../src/domain/avaliacoes';
import { useAvaliacoesPorSemestre } from '../../../src/hooks/useAvaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { useMediasPorMateria } from '../../../src/hooks/useMediasPorMateria';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';

function agruparPorMateria(avaliacoes: AvaliacaoComMateria[]) {
  const grupos = new Map<string, AvaliacaoComMateria[]>();
  for (const av of avaliacoes) {
    const lista = grupos.get(av.materiaNome) ?? [];
    lista.push(av);
    grupos.set(av.materiaNome, lista);
  }
  return Array.from(grupos.entries()).map(([titulo, data]) => ({
    title: titulo,
    data,
  }));
}

export default function ProvasTrabalhosScreen() {
  const { selecionado, semestre, irParaAnterior, irParaProximo } =
    useSemestreSelecionado();

  const { data: materias = [] } = useMateriasPorSemestre(semestre.id);
  const { data: avaliacoes = [] } = useAvaliacoesPorSemestre(semestre.id);
  const { data: medias = [] } = useMediasPorMateria(semestre.id);

  const secoes = useMemo(() => agruparPorMateria(avaliacoes), [avaliacoes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.seletor}>
          <Pressable onPress={irParaAnterior} hitSlop={12}>
            <Text style={styles.seta}>‹</Text>
          </Pressable>
          <Text style={styles.periodo}>
            {selecionado.anoValor} · {selecionado.numero}º semestre
          </Text>
          <Pressable onPress={irParaProximo} hitSlop={12}>
            <Text style={styles.seta}>›</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.botaoNovo}
          onPress={() =>
            router.push({
              pathname: '/provas-trabalhos/nova',
              params: { semestreId: String(semestre.id) },
            })
          }
        >
          <Text style={styles.botaoNovoTexto}>+ Avaliação</Text>
        </Pressable>
      </View>

      <MediasResumo medias={medias} />

      {materias.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma matéria ainda</Text>
          <Text style={styles.vazioTexto}>
            Crie a primeira matéria deste semestre pra começar a lançar provas
            e trabalhos.
          </Text>
          <Pressable
            style={styles.botaoVazio}
            onPress={() =>
              router.push({
                pathname: '/provas-trabalhos/nova-materia',
                params: { semestreId: String(semestre.id) },
              })
            }
          >
            <Text style={styles.botaoVazioTexto}>Criar matéria</Text>
          </Pressable>
        </View>
      ) : avaliacoes.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>
            Nenhuma prova ou trabalho por aqui ainda
          </Text>
          <Text style={styles.vazioTexto}>
            Que tal adicionar o primeiro?
          </Text>
        </View>
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          renderSectionHeader={({ section }) => (
            <Text style={styles.secaoTitulo}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <AvaliacaoCard
              avaliacao={item}
              onPress={() =>
                router.push({
                  pathname: '/provas-trabalhos/[id]',
                  params: { id: String(item.id), semestreId: String(semestre.id) },
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 18 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seta: {
    fontSize: 22,
    color: '#4F46E5',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  periodo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
  },
  botaoNovo: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  botaoNovoTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  vazioTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181B',
    textAlign: 'center',
  },
  vazioTexto: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
  },
  botaoVazio: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  botaoVazioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
