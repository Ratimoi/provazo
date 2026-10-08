import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  Aula,
  formatarDiasSemana,
} from '../../domain/eventosRecorrentes';
import { listInstituicoesDistintas, Materia } from '../../domain/materias';
import { normalizar } from '../../domain/texto';
import { useAulasPorSemestre } from '../../hooks/useAulas';
import { useMateriasMutations } from '../../hooks/useMateriasMutations';
import { useMateriasPorSemestre } from '../../hooks/useMaterias';
import { useMediasPorMateria } from '../../hooks/useMediasPorMateria';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { EditarAulaModal } from '../aulas/EditarAulaModal';
import { GerenciarAulasModal } from '../aulas/GerenciarAulasModal';
import { NovaAulaModal } from '../aulas/NovaAulaModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EditarMateriaModal } from './EditarMateriaModal';
import { MateriaAcoesModal } from './MateriaAcoesModal';
import { MateriaCard } from './MateriaCard';
import { NovaMateriaModal } from './NovaMateriaModal';

const LIMIAR_BUSCA_MATERIAS = 6;

/**
 * Seção "Matérias" da tela de Provas e Trabalhos: grade com busca, e todos os
 * modais de matéria e aula fixa (criar, editar, gerenciar, excluir).
 * O filtro por matéria fica com quem usa, pra também filtrar a lista de avaliações.
 */
export function MateriasSection({
  semestreId,
  materiaFiltroId,
  aoFiltrar,
}: {
  semestreId: number;
  materiaFiltroId: number | null;
  aoFiltrar: (materiaId: number | null) => void;
}) {
  const { data: materias = [] } = useMateriasPorSemestre(semestreId);
  const { data: medias = [] } = useMediasPorMateria(semestreId);
  const { data: aulas = [] } = useAulasPorSemestre(semestreId);
  const mutacoes = useMateriasMutations(semestreId);

  const [modalMateriaAberto, setModalMateriaAberto] = useState(false);
  const [modalAulaAberto, setModalAulaAberto] = useState(false);
  const [materiaIdParaAula, setMateriaIdParaAula] = useState<number | null>(null);
  const [buscaMateria, setBuscaMateria] = useState('');
  const [materiasExpandido, setMateriasExpandido] = useState(false);
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

  // Colapsada por padrão com muitas matérias, pra não tomar a tela toda —
  // busca ativa sempre mostra tudo que bate, sem essa limitação.
  const materiasParaExibir =
    materiasExpandido || buscaMateria.length > 0
      ? materiasVisiveis
      : materiasVisiveis.slice(0, LIMIAR_BUSCA_MATERIAS);
  const materiasEscondidas = materiasVisiveis.length - materiasParaExibir.length;

  // Recalcula sempre que a lista de matérias muda (após criar/editar), pra
  // sugerir instituições já usadas em qualquer semestre, não só o atual.
  const instituicoesSugeridas = useMemo(
    () => listInstituicoesDistintas(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [materias],
  );

  function abrirModalMateria() {
    mutacoes.criarMateria.reset();
    setModalMateriaAberto(true);
  }

  function abrirModalAula(materiaId: number | null) {
    mutacoes.criarAula.reset();
    setMateriaIdParaAula(materiaId);
    setModalAulaAberto(true);
  }

  function handleEditarDasAcoes() {
    if (!acoesMateria) return;
    mutacoes.editarMateria.reset();
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
    const { id } = confirmExcluirMateria;
    mutacoes.excluirMateria.mutate(id, {
      onSuccess: () => {
        if (materiaFiltroId === id) aoFiltrar(null);
      },
    });
    setConfirmExcluirMateria(null);
  }

  function handleAdicionarAulaDoGerenciamento() {
    if (!gerenciandoAulasDe) return;
    abrirModalAula(gerenciandoAulasDe.id);
    setGerenciandoAulasDe(null);
  }

  function handleEditarAula(aula: Aula) {
    mutacoes.editarAula.reset();
    setAulaEditando(aula);
    setGerenciandoAulasDe(null);
  }

  function handleExcluirAulaSolicitado(aula: Aula) {
    setConfirmExcluirAula(aula);
    setGerenciandoAulasDe(null);
  }

  function confirmarExclusaoAula() {
    if (!confirmExcluirAula) return;
    mutacoes.excluirAula.mutate(confirmExcluirAula.id);
    setConfirmExcluirAula(null);
  }

  return (
    <View style={styles.secao}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Matérias</Text>
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
          Nenhuma matéria encontrada pra &quot;{buscaMateria}&quot;.
        </Text>
      ) : (
        <View style={styles.grade}>
          {materiasParaExibir.map((materia) => {
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
                  aoFiltrar(materiaFiltroId === materia.id ? null : materia.id)
                }
                onLongPress={() => setAcoesMateria(materia)}
              />
            );
          })}
        </View>
      )}

      {materiasEscondidas > 0 && (
        <Pressable
          style={styles.verMais}
          onPress={() => setMateriasExpandido(true)}
        >
          <Text style={styles.verMaisTexto}>
            Ver mais {materiasEscondidas} matéria
            {materiasEscondidas === 1 ? '' : 's'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.brand} />
        </Pressable>
      )}

      {materiasExpandido &&
        buscaMateria.length === 0 &&
        materiasVisiveis.length > LIMIAR_BUSCA_MATERIAS && (
          <Pressable
            style={styles.verMais}
            onPress={() => setMateriasExpandido(false)}
          >
            <Text style={styles.verMaisTexto}>Ocultar</Text>
            <Ionicons name="chevron-up" size={14} color={colors.brand} />
          </Pressable>
        )}

      <NovaMateriaModal
        visivel={modalMateriaAberto}
        salvando={mutacoes.criarMateria.isPending}
        erro={mutacoes.criarMateria.error?.message}
        instituicoesSugeridas={instituicoesSugeridas}
        aoFechar={() => setModalMateriaAberto(false)}
        aoSalvar={(nome, corHex, instituicao) =>
          mutacoes.criarMateria.mutate(
            { nome, corHex, instituicao },
            { onSuccess: () => setModalMateriaAberto(false) },
          )
        }
      />
      <NovaAulaModal
        visivel={modalAulaAberto}
        materias={materias}
        materiaIdInicial={materiaIdParaAula}
        salvando={mutacoes.criarAula.isPending}
        erro={mutacoes.criarAula.error?.message}
        aoFechar={() => setModalAulaAberto(false)}
        aoSalvar={(dados) =>
          mutacoes.criarAula.mutate(dados, {
            onSuccess: () => setModalAulaAberto(false),
          })
        }
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
        salvando={mutacoes.editarAula.isPending}
        erro={mutacoes.editarAula.error?.message}
        aoFechar={() => setAulaEditando(null)}
        aoSalvar={(dados) => {
          if (!aulaEditando) return;
          mutacoes.editarAula.mutate(
            { id: aulaEditando.id, dados },
            { onSuccess: () => setAulaEditando(null) },
          );
        }}
      />
      <EditarMateriaModal
        visivel={materiaEditando !== null}
        materia={materiaEditando}
        salvando={mutacoes.editarMateria.isPending}
        erro={mutacoes.editarMateria.error?.message}
        instituicoesSugeridas={instituicoesSugeridas}
        aoFechar={() => setMateriaEditando(null)}
        aoSalvar={(nome, corHex, instituicao) => {
          if (!materiaEditando) return;
          mutacoes.editarMateria.mutate(
            { id: materiaEditando.id, nome, corHex, instituicao },
            { onSuccess: () => setMateriaEditando(null) },
          );
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
    </View>
  );
}

const styles = StyleSheet.create({
  secao: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  titulo: {
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
  verMais: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verMaisTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.brand,
  },
});
