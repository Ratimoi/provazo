import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacaoCard } from '../../../src/components/avaliacoes/AvaliacaoCard';
import { MateriasSection } from '../../../src/components/materias/MateriasSection';
import { EditarTarefaModal } from '../../../src/components/tarefas/EditarTarefaModal';
import { TarefasSection } from '../../../src/components/tarefas/TarefasSection';
import type { AvaliacaoComMateria } from '../../../src/domain/avaliacoes';
import type { Tarefa } from '../../../src/domain/tarefas';
import { useAvaliacoesPorSemestre } from '../../../src/hooks/useAvaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';
import { useTarefas } from '../../../src/hooks/useTarefas';
import { useTarefasMutations } from '../../../src/hooks/useTarefasMutations';
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
    instituicao: data[0]?.materiaInstituicao ?? null,
    data,
  }));
}

export default function ProvasTrabalhosScreen() {
  const { selecionado, semestre, irParaAnterior, irParaProximo } =
    useSemestreSelecionado();

  const { data: materias = [] } = useMateriasPorSemestre(semestre.id);
  const { data: avaliacoes = [] } = useAvaliacoesPorSemestre(semestre.id);
  const { data: tarefas = [] } = useTarefas();
  const tarefasMutacoes = useTarefasMutations();

  const [materiaFiltroId, setMateriaFiltroId] = useState<number | null>(null);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);

  const secoes = useMemo(
    () =>
      agruparPorMateria(
        materiaFiltroId
          ? avaliacoes.filter((av) => av.materiaId === materiaFiltroId)
          : avaliacoes,
      ),
    [avaliacoes, materiaFiltroId],
  );

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

      <MateriasSection
        semestreId={semestre.id}
        materiaFiltroId={materiaFiltroId}
        aoFiltrar={setMateriaFiltroId}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SectionList
          sections={secoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={cabecalho}
          ListFooterComponent={
            <View style={styles.rodape}>
              <TarefasSection
                tarefas={tarefas}
                aoCriar={(titulo) => tarefasMutacoes.criar.mutate(titulo)}
                aoAlternar={(id, concluida) =>
                  tarefasMutacoes.alternar.mutate({ id, concluida })
                }
                aoExcluir={(id) => tarefasMutacoes.excluir.mutate(id)}
                aoEditar={(tarefa) => setTarefaEditando(tarefa)}
              />
            </View>
          }
          ListEmptyComponent={
            <EstadoVazio
              semMaterias={materias.length === 0}
              filtrando={materiaFiltroId !== null}
            />
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.secaoTituloMateria}>
              {section.title}
              {section.instituicao ? ` · ${section.instituicao}` : ''}
            </Text>
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
      </KeyboardAvoidingView>

      <EditarTarefaModal
        visivel={tarefaEditando !== null}
        tarefa={tarefaEditando}
        salvando={tarefasMutacoes.editar.isPending}
        aoFechar={() => setTarefaEditando(null)}
        aoSalvar={(dados) => {
          if (!tarefaEditando) return;
          tarefasMutacoes.editar.mutate(
            { id: tarefaEditando.id, dados },
            { onSuccess: () => setTarefaEditando(null) },
          );
        }}
      />
    </SafeAreaView>
  );
}

function EstadoVazio({
  semMaterias,
  filtrando,
}: {
  semMaterias: boolean;
  filtrando: boolean;
}) {
  return (
    <View style={styles.vazio}>
      <View style={styles.vazioIconContainer}>
        <Ionicons
          name={semMaterias ? 'school-outline' : 'document-text-outline'}
          size={28}
          color={colors.brand}
        />
      </View>
      <Text style={styles.vazioTitulo}>
        {semMaterias
          ? 'Nenhuma matéria ainda'
          : filtrando
            ? 'Nada por aqui pra essa matéria'
            : 'Nenhuma prova ou trabalho por aqui ainda'}
      </Text>
      <Text style={styles.vazioTexto}>
        {semMaterias
          ? 'Toque no + ao lado de "Matérias" acima pra criar a primeira.'
          : filtrando
            ? 'Toque de novo no chip pra ver todas de novo.'
            : 'Que tal adicionar o primeiro?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
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
  lista: {
    paddingBottom: 48,
  },
  rodape: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.lg,
    padding: spacing.md,
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
