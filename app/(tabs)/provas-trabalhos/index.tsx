import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacaoCard } from '../../../src/components/avaliacoes/AvaliacaoCard';
import { EditarAulaModal } from '../../../src/components/aulas/EditarAulaModal';
import { GerenciarAulasModal } from '../../../src/components/aulas/GerenciarAulasModal';
import { NovaAulaModal } from '../../../src/components/aulas/NovaAulaModal';
import { EditarMateriaModal } from '../../../src/components/materias/EditarMateriaModal';
import { MateriaAcoesModal } from '../../../src/components/materias/MateriaAcoesModal';
import { MateriaCard } from '../../../src/components/materias/MateriaCard';
import { NovaMateriaModal } from '../../../src/components/materias/NovaMateriaModal';
import { TarefasSection } from '../../../src/components/tarefas/TarefasSection';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import type { AvaliacaoComMateria } from '../../../src/domain/avaliacoes';
import {
  Aula,
  createAula,
  deleteAula,
  formatarDiasSemana,
  NovaAula,
  updateAula,
} from '../../../src/domain/eventosRecorrentes';
import {
  createMateria,
  deleteMateria,
  listInstituicoesDistintas,
  Materia,
  updateMateria,
} from '../../../src/domain/materias';
import {
  createTarefa,
  deleteTarefa,
  toggleTarefaConcluida,
} from '../../../src/domain/tarefas';
import { aulasQueryKey, useAulasPorSemestre } from '../../../src/hooks/useAulas';
import {
  avaliacoesQueryKey,
  useAvaliacoesPorSemestre,
} from '../../../src/hooks/useAvaliacoes';
import { materiasQueryKey, useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { mediasQueryKey, useMediasPorMateria } from '../../../src/hooks/useMediasPorMateria';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';
import { TAREFAS_QUERY_KEY, useTarefas } from '../../../src/hooks/useTarefas';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

const LIMIAR_BUSCA_MATERIAS = 6;

/** Ignora acentos na busca, pra "calculo" achar "Cálculo". */
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

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

function mensagemAmigavel(erro: unknown): string | undefined {
  if (!(erro instanceof Error)) return undefined;
  if (erro.message.includes('UNIQUE constraint failed')) {
    return erro.message.includes('materia')
      ? 'Essa matéria já existe nesse semestre.'
      : 'Essa aula já está cadastrada pra esse dia e horário.';
  }
  if (erro.message.includes('FOREIGN KEY constraint failed')) {
    return 'Algo que essa ação depende foi removido enquanto isso. Feche e abra a tela de novo.';
  }
  return erro.message;
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
  const [materiaIdParaAula, setMateriaIdParaAula] = useState<number | null>(
    null,
  );
  const [materiaFiltroId, setMateriaFiltroId] = useState<number | null>(null);
  const [buscaMateria, setBuscaMateria] = useState('');
  const [acoesMateria, setAcoesMateria] = useState<Materia | null>(null);
  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);
  const [confirmExcluirMateria, setConfirmExcluirMateria] =
    useState<Materia | null>(null);
  const [gerenciandoAulasDe, setGerenciandoAulasDe] = useState<Materia | null>(
    null,
  );
  const [aulaEditando, setAulaEditando] = useState<Aula | null>(null);
  const [confirmExcluirAula, setConfirmExcluirAula] = useState<Aula | null>(
    null,
  );

  const mediasPorMateria = useMemo(
    () => new Map(medias.map((m) => [m.materiaId, m])),
    [medias],
  );
  const aulasPorMateria = useMemo(() => {
    const mapa = new Map<number, Aula[]>();
    for (const aula of aulas) {
      const lista = mapa.get(aula.materiaId) ?? [];
      lista.push(aula);
      mapa.set(aula.materiaId, lista);
    }
    return mapa;
  }, [aulas]);

  const materiasVisiveis = useMemo(() => {
    const busca = normalizar(buscaMateria);
    if (busca.length === 0) return materias;
    return materias.filter(
      (m) =>
        normalizar(m.nome).includes(busca) ||
        (m.instituicao && normalizar(m.instituicao).includes(busca)),
    );
  }, [materias, buscaMateria]);

  // Recalcula sempre que a lista de matérias muda (após criar/editar), pra
  // sugerir instituições já usadas em qualquer semestre, não só o atual.
  const instituicoesSugeridas = useMemo(
    () => listInstituicoesDistintas(),
    [materias],
  );

  const avaliacoesFiltradas = useMemo(
    () =>
      materiaFiltroId
        ? avaliacoes.filter((av) => av.materiaId === materiaFiltroId)
        : avaliacoes,
    [avaliacoes, materiaFiltroId],
  );
  const secoes = useMemo(
    () => agruparPorMateria(avaliacoesFiltradas),
    [avaliacoesFiltradas],
  );

  function invalidarTudoDoSemestre() {
    queryClient.invalidateQueries({ queryKey: materiasQueryKey(semestre.id) });
    queryClient.invalidateQueries({
      queryKey: avaliacoesQueryKey(semestre.id),
    });
    queryClient.invalidateQueries({ queryKey: mediasQueryKey(semestre.id) });
    queryClient.invalidateQueries({ queryKey: aulasQueryKey(semestre.id) });
  }

  const mutacaoMateria = useMutation({
    mutationFn: ({
      nome,
      corHex,
      instituicao,
    }: {
      nome: string;
      corHex: string | null;
      instituicao: string | null;
    }) => {
      const nomeLimpo = nome.trim();
      if (nomeLimpo.length === 0) {
        throw new Error('Dê um nome pra matéria.');
      }
      try {
        return Promise.resolve(
          createMateria(semestre.id, nomeLimpo, corHex ?? undefined, instituicao),
        );
      } catch (e) {
        throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materiasQueryKey(semestre.id),
      });
      setModalMateriaAberto(false);
    },
  });

  const mutacaoMateriaEditar = useMutation({
    mutationFn: ({
      id,
      nome,
      corHex,
      instituicao,
    }: {
      id: number;
      nome: string;
      corHex: string;
      instituicao: string | null;
    }) => {
      const nomeLimpo = nome.trim();
      if (nomeLimpo.length === 0) {
        throw new Error('Dê um nome pra matéria.');
      }
      try {
        return Promise.resolve(
          updateMateria(id, { nome: nomeLimpo, corHex, instituicao }),
        );
      } catch (e) {
        throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
      }
    },
    onSuccess: () => {
      invalidarTudoDoSemestre();
      setMateriaEditando(null);
    },
  });

  const mutacaoMateriaExcluir = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteMateria(id)),
    onSuccess: (_resultado, id) => {
      invalidarTudoDoSemestre();
      setMateriaFiltroId((atual) => (atual === id ? null : atual));
    },
  });

  const mutacaoAula = useMutation({
    mutationFn: (dados: NovaAula) => {
      try {
        return Promise.resolve(createAula(dados));
      } catch (e) {
        throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aulasQueryKey(semestre.id) });
      setModalAulaAberto(false);
    },
  });

  const mutacaoAulaEditar = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: NovaAula }) => {
      try {
        return Promise.resolve(updateAula(id, dados));
      } catch (e) {
        throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aulasQueryKey(semestre.id) });
      setAulaEditando(null);
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

  function abrirModalMateria() {
    mutacaoMateria.reset();
    setModalMateriaAberto(true);
  }

  function abrirModalAula(materiaId: number | null) {
    mutacaoAula.reset();
    setMateriaIdParaAula(materiaId);
    setModalAulaAberto(true);
  }

  function handleLongPressMateria(materia: Materia) {
    setAcoesMateria(materia);
  }

  function handleEditarDasAcoes() {
    if (!acoesMateria) return;
    mutacaoMateriaEditar.reset();
    setMateriaEditando(acoesMateria);
    setAcoesMateria(null);
  }

  function handleGerenciarAulasDasAcoes() {
    if (!acoesMateria) return;
    setGerenciandoAulasDe(acoesMateria);
    setAcoesMateria(null);
  }

  function handleExcluirDasAcoes() {
    if (!acoesMateria) return;
    setConfirmExcluirMateria(acoesMateria);
    setAcoesMateria(null);
  }

  function confirmarExclusaoMateria() {
    if (!confirmExcluirMateria) return;
    mutacaoMateriaExcluir.mutate(confirmExcluirMateria.id);
    setConfirmExcluirMateria(null);
  }

  function handleAdicionarAulaDoGerenciamento() {
    if (!gerenciandoAulasDe) return;
    abrirModalAula(gerenciandoAulasDe.id);
    setGerenciandoAulasDe(null);
  }

  function handleEditarAula(aula: Aula) {
    mutacaoAulaEditar.reset();
    setAulaEditando(aula);
    setGerenciandoAulasDe(null);
  }

  function handleExcluirAulaSolicitado(aula: Aula) {
    setConfirmExcluirAula(aula);
    setGerenciandoAulasDe(null);
  }

  function confirmarExclusaoAula() {
    if (!confirmExcluirAula) return;
    mutacaoAulaExcluir.mutate(confirmExcluirAula.id);
    setConfirmExcluirAula(null);
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

      <View style={styles.secaoChips}>
        <View style={styles.secaoCabecalho}>
          <Text style={styles.secaoTitulo}>Matérias</Text>
          <Pressable onPress={abrirModalMateria} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={20} color={colors.brand} />
          </Pressable>
        </View>

        {materias.length > LIMIAR_BUSCA_MATERIAS && (
          <View style={styles.busca}>
            <Ionicons name="search-outline" size={16} color={colors.inkFaint} />
            <TextInput
              style={styles.buscaInput}
              placeholder="Buscar por matéria ou instituição…"
              value={buscaMateria}
              onChangeText={setBuscaMateria}
              returnKeyType="search"
            />
            {buscaMateria.length > 0 && (
              <Pressable onPress={() => setBuscaMateria('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.inkFaint} />
              </Pressable>
            )}
          </View>
        )}

        {materiasVisiveis.length === 0 ? (
          <Text style={styles.buscaSemResultado}>
            Nenhuma matéria encontrada pra "{buscaMateria}".
          </Text>
        ) : (
          <View style={styles.grade}>
            {materiasVisiveis.map((materia) => {
              const aulasDaMateria = aulasPorMateria.get(materia.id) ?? [];
              const aulaResumo =
                aulasDaMateria.length > 0
                  ? aulasDaMateria
                      .map(
                        (a) => `${formatarDiasSemana(a.diasSemana)} ${a.horaInicio}`,
                      )
                      .join(' · ')
                  : null;
              return (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  media={mediasPorMateria.get(materia.id)?.media ?? null}
                  aulaResumo={aulaResumo}
                  ativo={materiaFiltroId === materia.id}
                  onPress={() =>
                    setMateriaFiltroId((atual) =>
                      atual === materia.id ? null : materia.id,
                    )
                  }
                  onLongPress={() => handleLongPressMateria(materia)}
                />
              );
            })}
          </View>
        )}
      </View>
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
                {materiaFiltroId
                  ? 'Nada por aqui pra essa matéria'
                  : 'Nenhuma prova ou trabalho por aqui ainda'}
              </Text>
              <Text style={styles.vazioTexto}>
                {materiaFiltroId
                  ? 'Toque de novo no chip pra ver todas de novo.'
                  : 'Que tal adicionar o primeiro?'}
              </Text>
            </View>
          )
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

      <NovaMateriaModal
        visivel={modalMateriaAberto}
        salvando={mutacaoMateria.isPending}
        erro={mutacaoMateria.error?.message}
        instituicoesSugeridas={instituicoesSugeridas}
        aoFechar={() => setModalMateriaAberto(false)}
        aoSalvar={(nome, corHex, instituicao) =>
          mutacaoMateria.mutate({ nome, corHex, instituicao })
        }
      />
      <NovaAulaModal
        visivel={modalAulaAberto}
        materias={materias}
        materiaIdInicial={materiaIdParaAula}
        salvando={mutacaoAula.isPending}
        erro={mutacaoAula.error?.message}
        aoFechar={() => setModalAulaAberto(false)}
        aoSalvar={(dados) => mutacaoAula.mutate(dados)}
      />
      <MateriaAcoesModal
        visivel={acoesMateria !== null}
        materia={acoesMateria}
        aoFechar={() => setAcoesMateria(null)}
        aoEditar={handleEditarDasAcoes}
        aoGerenciarAulas={handleGerenciarAulasDasAcoes}
        aoExcluir={handleExcluirDasAcoes}
      />
      <GerenciarAulasModal
        visivel={gerenciandoAulasDe !== null}
        materia={gerenciandoAulasDe}
        aulas={
          gerenciandoAulasDe
            ? (aulasPorMateria.get(gerenciandoAulasDe.id) ?? [])
            : []
        }
        aoFechar={() => setGerenciandoAulasDe(null)}
        aoEditarAula={handleEditarAula}
        aoExcluirAula={handleExcluirAulaSolicitado}
        aoAdicionarAula={handleAdicionarAulaDoGerenciamento}
      />
      <EditarAulaModal
        visivel={aulaEditando !== null}
        aula={aulaEditando}
        salvando={mutacaoAulaEditar.isPending}
        erro={mutacaoAulaEditar.error?.message}
        aoFechar={() => setAulaEditando(null)}
        aoSalvar={(dados) => {
          if (!aulaEditando) return;
          mutacaoAulaEditar.mutate({ id: aulaEditando.id, dados });
        }}
      />
      <EditarMateriaModal
        visivel={materiaEditando !== null}
        materia={materiaEditando}
        salvando={mutacaoMateriaEditar.isPending}
        erro={mutacaoMateriaEditar.error?.message}
        instituicoesSugeridas={instituicoesSugeridas}
        aoFechar={() => setMateriaEditando(null)}
        aoSalvar={(nome, corHex, instituicao) => {
          if (!materiaEditando) return;
          mutacaoMateriaEditar.mutate({
            id: materiaEditando.id,
            nome,
            corHex,
            instituicao,
          });
        }}
      />
      <ConfirmModal
        visivel={confirmExcluirMateria !== null}
        titulo={`Excluir ${confirmExcluirMateria?.nome ?? ''}?`}
        mensagem="Isso apaga também todas as avaliações e aulas fixas dessa matéria. Não dá pra desfazer."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={confirmarExclusaoMateria}
        aoCancelar={() => setConfirmExcluirMateria(null)}
      />
      <ConfirmModal
        visivel={confirmExcluirAula !== null}
        titulo="Excluir aula?"
        mensagem={
          confirmExcluirAula
            ? `${formatarDiasSemana(confirmExcluirAula.diasSemana)} ${confirmExcluirAula.horaInicio} não vai mais aparecer automaticamente na Timeline.`
            : undefined
        }
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={confirmarExclusaoAula}
        aoCancelar={() => setConfirmExcluirAula(null)}
      />
    </SafeAreaView>
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
  secaoChips: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  secaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  buscaInput: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  buscaSemResultado: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkFaint,
    paddingHorizontal: spacing.lg,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
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
