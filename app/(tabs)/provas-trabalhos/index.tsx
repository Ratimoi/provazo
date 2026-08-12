import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacaoCard } from '../../../src/components/avaliacoes/AvaliacaoCard';
import { MediasResumo } from '../../../src/components/avaliacoes/MediasResumo';
import { NovaAulaModal } from '../../../src/components/aulas/NovaAulaModal';
import { NovaMateriaModal } from '../../../src/components/materias/NovaMateriaModal';
import { TarefasSection } from '../../../src/components/tarefas/TarefasSection';
import type { AvaliacaoComMateria } from '../../../src/domain/avaliacoes';
import {
  Aula,
  createAula,
  deleteAula,
  formatarDiasSemana,
  NovaAula,
} from '../../../src/domain/eventosRecorrentes';
import { createMateria } from '../../../src/domain/materias';
import {
  createTarefa,
  deleteTarefa,
  toggleTarefaConcluida,
} from '../../../src/domain/tarefas';
import { aulasQueryKey, useAulasPorSemestre } from '../../../src/hooks/useAulas';
import { useAvaliacoesPorSemestre } from '../../../src/hooks/useAvaliacoes';
import { materiasQueryKey, useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { useMediasPorMateria } from '../../../src/hooks/useMediasPorMateria';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';
import { TAREFAS_QUERY_KEY, useTarefas } from '../../../src/hooks/useTarefas';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

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
  const queryClient = useQueryClient();

  const { data: materias = [] } = useMateriasPorSemestre(semestre.id);
  const { data: avaliacoes = [] } = useAvaliacoesPorSemestre(semestre.id);
  const { data: medias = [] } = useMediasPorMateria(semestre.id);
  const { data: aulas = [] } = useAulasPorSemestre(semestre.id);
  const { data: tarefas = [] } = useTarefas();

  const [modalMateriaAberto, setModalMateriaAberto] = useState(false);
  const [modalAulaAberto, setModalAulaAberto] = useState(false);

  const secoes = useMemo(() => agruparPorMateria(avaliacoes), [avaliacoes]);

  const mutacaoMateria = useMutation({
    mutationFn: ({ nome, corHex }: { nome: string; corHex: string | null }) => {
      if (nome.trim().length === 0) {
        throw new Error('Dê um nome pra matéria.');
      }
      return Promise.resolve(
        createMateria(semestre.id, nome.trim(), corHex ?? undefined),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materiasQueryKey(semestre.id),
      });
      setModalMateriaAberto(false);
    },
  });

  const mutacaoAula = useMutation({
    mutationFn: (dados: NovaAula) => Promise.resolve(createAula(dados)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aulasQueryKey(semestre.id) });
      setModalAulaAberto(false);
    },
  });

  const mutacaoAulaExcluir = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteAula(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aulasQueryKey(semestre.id) });
    },
  });

  const mutacaoTarefaCriar = useMutation({
    mutationFn: (titulo: string) => Promise.resolve(createTarefa(titulo)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TAREFAS_QUERY_KEY }),
  });
  const mutacaoTarefaAlternar = useMutation({
    mutationFn: ({ id, concluida }: { id: number; concluida: boolean }) =>
      Promise.resolve(toggleTarefaConcluida(id, concluida)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TAREFAS_QUERY_KEY }),
  });
  const mutacaoTarefaExcluir = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteTarefa(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TAREFAS_QUERY_KEY }),
  });

  function confirmarExclusaoAula(aula: Aula) {
    Alert.alert(
      aula.materiaNome,
      `${formatarDiasSemana(aula.diasSemana)} · ${aula.horaInicio}${aula.horaFim ? `–${aula.horaFim}` : ''}`,
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Excluir aula',
          style: 'destructive',
          onPress: () => mutacaoAulaExcluir.mutate(aula.id),
        },
      ],
    );
  }

  const cabecalho = (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.tituloPagina}>Provas e Trabalhos</Text>
          <View style={styles.seletor}>
            <Pressable onPress={irParaAnterior} hitSlop={10}>
              <Ionicons name="chevron-back" size={18} color={colors.brand} />
            </Pressable>
            <Text style={styles.periodo}>
              {selecionado.anoValor} · {selecionado.numero}º semestre
            </Text>
            <Pressable onPress={irParaProximo} hitSlop={10}>
              <Ionicons name="chevron-forward" size={18} color={colors.brand} />
            </Pressable>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.botaoNovo,
            pressed && styles.botaoPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/provas-trabalhos/nova',
              params: { semestreId: String(semestre.id) },
            })
          }
        >
          <Ionicons name="add" size={18} color={colors.surface} />
          <Text style={styles.botaoNovoTexto}>Avaliação</Text>
        </Pressable>
      </View>

      <MediasResumo medias={medias} />

      <View style={styles.secaoChips}>
        <Text style={styles.secaoTitulo}>Matérias</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {materias.map((materia) => (
              <View key={materia.id} style={styles.chipMateria}>
                <View
                  style={[styles.dotChip, { backgroundColor: materia.corHex }]}
                />
                <Text style={styles.chipMateriaTexto}>{materia.nome}</Text>
              </View>
            ))}
            <Pressable
              style={styles.chipAdicionar}
              onPress={() => setModalMateriaAberto(true)}
            >
              <Ionicons name="add" size={16} color={colors.brand} />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {materias.length > 0 && (
        <View style={styles.secaoChips}>
          <Text style={styles.secaoTitulo}>Aulas fixas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {aulas.map((aula) => (
                <Pressable
                  key={aula.id}
                  style={styles.chipAula}
                  onPress={() => confirmarExclusaoAula(aula)}
                >
                  <View
                    style={[
                      styles.dotChip,
                      { backgroundColor: aula.materiaCorHex },
                    ]}
                  />
                  <Text style={styles.chipMateriaTexto}>
                    {aula.materiaNome} · {formatarDiasSemana(aula.diasSemana)} ·{' '}
                    {aula.horaInicio}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.chipAdicionar}
                onPress={() => setModalAulaAberto(true)}
              >
                <Ionicons name="add" size={16} color={colors.brand} />
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

      {(materias.length === 0 || avaliacoes.length > 0) && (
        <Text style={[styles.secaoTitulo, styles.listaTitulo]}>
          Provas e trabalhos
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={secoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={cabecalho}
        ListFooterComponent={
          <View style={styles.rodape}>
            <TarefasSection
              tarefas={tarefas}
              aoCriar={(titulo) => mutacaoTarefaCriar.mutate(titulo)}
              aoAlternar={(id, concluida) =>
                mutacaoTarefaAlternar.mutate({ id, concluida })
              }
              aoExcluir={(id) => mutacaoTarefaExcluir.mutate(id)}
            />
          </View>
        }
        ListEmptyComponent={
          materias.length === 0 ? (
            <View style={styles.vazio}>
              <View style={styles.vazioIconContainer}>
                <Ionicons name="school-outline" size={28} color={colors.brand} />
              </View>
              <Text style={styles.vazioTitulo}>Nenhuma matéria ainda</Text>
              <Text style={styles.vazioTexto}>
                Toque no + ao lado de "Matérias" acima pra criar a primeira.
              </Text>
            </View>
          ) : (
            <View style={styles.vazio}>
              <View style={styles.vazioIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={colors.brand}
                />
              </View>
              <Text style={styles.vazioTitulo}>
                Nenhuma prova ou trabalho por aqui ainda
              </Text>
              <Text style={styles.vazioTexto}>Que tal adicionar o primeiro?</Text>
            </View>
          )
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.secaoTituloMateria}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <AvaliacaoCard
              avaliacao={item}
              onPress={() =>
                router.push({
                  pathname: '/provas-trabalhos/[id]',
                  params: {
                    id: String(item.id),
                    semestreId: String(semestre.id),
                  },
                })
              }
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
      />

      <NovaMateriaModal
        visivel={modalMateriaAberto}
        salvando={mutacaoMateria.isPending}
        erro={mutacaoMateria.error?.message}
        aoFechar={() => setModalMateriaAberto(false)}
        aoSalvar={(nome, corHex) => mutacaoMateria.mutate({ nome, corHex })}
      />
      <NovaAulaModal
        visivel={modalAulaAberto}
        materias={materias}
        salvando={mutacaoAula.isPending}
        erro={mutacaoAula.error?.message}
        aoFechar={() => setModalAulaAberto(false)}
        aoSalvar={(dados) => mutacaoAula.mutate(dados)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  tituloPagina: {
    fontFamily: font.display,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodo: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  botaoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    ...shadow.floating,
  },
  botaoPressed: {
    opacity: 0.85,
  },
  botaoNovoTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 14,
  },
  secaoChips: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
  },
  listaTitulo: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipMateria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  chipAula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  dotChip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipMateriaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.ink,
  },
  chipAdicionar: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    paddingBottom: 48,
  },
  rodape: {
    marginTop: spacing.xl,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  secaoTituloMateria: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  vazioIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  vazioTitulo: {
    fontFamily: font.displayMedium,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
