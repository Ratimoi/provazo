import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { agruparPorInstituicao } from '../../domain/agrupamento';
import type { Aula } from '../../domain/eventosRecorrentes';
import {
  listInstituicoesDistintas,
  type Materia,
  proximaCorDaPaleta,
} from '../../domain/materias';
import { normalizar } from '../../domain/texto';
import { useAulasPorSemestre } from '../../hooks/useAulas';
import { useMateriasPorSemestre } from '../../hooks/useMaterias';
import { useMateriasMutations } from '../../hooks/useMateriasMutations';
import { useMediasPorMateria } from '../../hooks/useMediasPorMateria';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { SelecionarMateriaModal } from '../avaliacoes/SelecionarMateriaModal';
import { GradeSemanal } from '../materias/GradeSemanal';
import { MateriaAcoesModal } from '../materias/MateriaAcoesModal';
import { MateriaCard } from '../materias/MateriaCard';
import { MateriaForm, type OutraAula } from '../materias/MateriaForm';
import { ConfirmModal } from '../ui/ConfirmModal';
import { SegmentedControl } from '../ui/SegmentedControl';

const LIMIAR_BUSCA = 6;

type Modo = 'lista' | 'grade';

type FormularioAberto = {
  materia: Materia | null;
  diaInicial?: number | null;
  horaInicial?: string;
};

/**
 * Aba "Matérias": lista agrupada por instituição (ou grade semanal), com
 * criação e edição da matéria junto dos horários de aula numa tela só.
 */
export function MateriasTab({ semestreId }: { semestreId: number }) {
  const { data: materias = [] } = useMateriasPorSemestre(semestreId);
  const { data: medias = [] } = useMediasPorMateria(semestreId);
  const { data: aulas = [] } = useAulasPorSemestre(semestreId);
  const mutacoes = useMateriasMutations(semestreId);

  const [modo, setModo] = useState<Modo>('lista');
  const [busca, setBusca] = useState('');
  const [formulario, setFormulario] = useState<FormularioAberto | null>(null);
  const [acoes, setAcoes] = useState<Materia | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Materia | null>(null);
  const [vazioTocado, setVazioTocado] = useState<{ dia: number; hora: string } | null>(
    null,
  );

  const mediasPorMateria = useMemo(
    () => new Map(medias.map((m) => [m.materiaId, m.media])),
    [medias],
  );
  const aulasPorMateria = useMemo(() => {
    const mapa = new Map<number, Aula[]>();
    for (const aula of aulas) {
      mapa.set(aula.materiaId, [...(mapa.get(aula.materiaId) ?? []), aula]);
    }
    return mapa;
  }, [aulas]);

  const visiveis = useMemo(() => {
    const termo = normalizar(busca);
    if (termo.length === 0) return materias;
    return materias.filter(
      (m) =>
        normalizar(m.nome).includes(termo) ||
        (m.instituicao && normalizar(m.instituicao).includes(termo)),
    );
  }, [materias, busca]);
  const grupos = useMemo(() => agruparPorInstituicao(visiveis), [visiveis]);

  const instituicoesSugeridas = useMemo(
    () => listInstituicoesDistintas(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [materias],
  );

  const outrasAulas = useMemo<OutraAula[]>(() => {
    const editandoId = formulario?.materia?.id ?? null;
    return aulas
      .filter((a) => a.materiaId !== editandoId && a.horaFim)
      .flatMap((a) =>
        a.diasSemana.map((diaSemana) => ({
          diaSemana,
          horaInicio: a.horaInicio,
          horaFim: a.horaFim as string,
          materiaNome: a.materiaNome,
        })),
      );
  }, [aulas, formulario]);

  function abrirFormulario(dados: FormularioAberto) {
    mutacoes.criarMateria.reset();
    mutacoes.editarMateria.reset();
    setFormulario(dados);
  }

  function salvar(dados: Parameters<React.ComponentProps<typeof MateriaForm>['aoSalvar']>[0]) {
    const horarios = dados.horarios.map((h) => ({
      id: h.id,
      diaSemana: h.diaSemana,
      horaInicio: h.horaInicio,
      horaFim: h.horaFim,
      observacoes: h.observacoes || null,
    }));
    const base = {
      nome: dados.nome,
      corHex: dados.corHex,
      instituicao: dados.instituicao,
      horarios,
    };
    const aoTerminar = { onSuccess: () => setFormulario(null) };
    if (formulario?.materia) {
      mutacoes.editarMateria.mutate({ ...base, id: formulario.materia.id }, aoTerminar);
    } else {
      mutacoes.criarMateria.mutate(base, aoTerminar);
    }
  }

  function confirmarExclusaoMateria() {
    if (!confirmarExclusao) return;
    mutacoes.excluirMateria.mutate(confirmarExclusao.id);
    setConfirmarExclusao(null);
  }

  function escolherMateriaParaHorario(materiaId: number) {
    const materia = materias.find((m) => m.id === materiaId) ?? null;
    if (materia && vazioTocado) {
      abrirFormulario({
        materia,
        diaInicial: vazioTocado.dia,
        horaInicial: vazioTocado.hora,
      });
    }
    setVazioTocado(null);
  }

  function tocarHorarioLivre(dia: number, hora: string) {
    if (materias.length === 0) {
      abrirFormulario({ materia: null, diaInicial: dia, horaInicial: hora });
    } else {
      setVazioTocado({ dia, hora });
    }
  }

  const salvando = mutacoes.criarMateria.isPending || mutacoes.editarMateria.isPending;
  const erroFormulario = (formulario?.materia
    ? mutacoes.editarMateria.error
    : mutacoes.criarMateria.error
  )?.message;

  return (
    <View style={styles.raiz}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {materias.length === 0 ? (
          <View style={styles.vazio}>
            <View style={styles.vazioIcone}>
              <Ionicons name="school-outline" size={28} color={colors.brand} />
            </View>
            <Text style={styles.vazioTitulo}>Nenhuma matéria ainda</Text>
            <Text style={styles.vazioTexto}>
              Cadastre a primeira com os horários das aulas, tudo numa tela só.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.linhaBusca}>
              {materias.length > LIMIAR_BUSCA ? (
                <View style={styles.busca}>
                  <Ionicons name="search-outline" size={16} color={colors.inkSoft} />
                  <TextInput
                    style={styles.buscaInput}
                    placeholder="Buscar matéria ou instituição"
                    placeholderTextColor={colors.inkSoft}
                    value={busca}
                    onChangeText={setBusca}
                    returnKeyType="search"
                  />
                  {busca.length > 0 && (
                    <Pressable onPress={() => setBusca('')} hitSlop={8}>
                      <Ionicons name="close-circle" size={16} color={colors.inkSoft} />
                    </Pressable>
                  )}
                </View>
              ) : (
                <Text style={styles.contagem}>
                  {materias.length} matéria{materias.length === 1 ? '' : 's'}
                </Text>
              )}
              <View style={styles.alternancia}>
                <SegmentedControl
                  compacto
                  valor={modo}
                  aoMudar={setModo}
                  opcoes={[
                    { valor: 'lista', rotulo: 'Lista' },
                    { valor: 'grade', rotulo: 'Grade' },
                  ]}
                />
              </View>
            </View>

            {modo === 'grade' ? (
              <>
                <Text style={styles.dica}>Toque num horário livre pra criar uma aula</Text>
                <GradeSemanal
                  aulas={aulas}
                  aoPressionarAula={(aula) => {
                    const materia = materias.find((m) => m.id === aula.materiaId);
                    if (materia) abrirFormulario({ materia });
                  }}
                  aoPressionarVazio={tocarHorarioLivre}
                />
              </>
            ) : visiveis.length === 0 ? (
              <Text style={styles.semResultado}>
                Nenhuma matéria encontrada pra &quot;{busca}&quot;.
              </Text>
            ) : (
              grupos.map((grupo) => (
                <View key={grupo.instituicao ?? 'sem'} style={styles.grupo}>
                  {(grupos.length > 1 || grupo.instituicao) && (
                    <Text style={styles.grupoTitulo}>
                      {grupo.instituicao ?? 'Sem instituição'} · {grupo.itens.length}
                    </Text>
                  )}
                  {grupo.itens.map((materia) => (
                    <MateriaCard
                      key={materia.id}
                      materia={materia}
                      media={mediasPorMateria.get(materia.id) ?? null}
                      aulas={aulasPorMateria.get(materia.id) ?? []}
                      aoPressionar={() => abrirFormulario({ materia })}
                      aoAbrirMenu={() => setAcoes(materia)}
                      aoAdicionarHorario={() => abrirFormulario({ materia })}
                    />
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressionado]}
        onPress={() => abrirFormulario({ materia: null })}
      >
        <Ionicons name="add" size={20} color={colors.surface} />
        <Text style={styles.fabTexto}>Matéria</Text>
      </Pressable>

      <MateriaForm
        visivel={formulario !== null}
        materia={formulario?.materia ?? null}
        aulasDaMateria={
          formulario?.materia ? (aulasPorMateria.get(formulario.materia.id) ?? []) : []
        }
        outrasAulas={outrasAulas}
        corPadrao={proximaCorDaPaleta(semestreId)}
        instituicoesSugeridas={instituicoesSugeridas}
        diaInicial={formulario?.diaInicial}
        horaInicial={formulario?.horaInicial}
        salvando={salvando}
        erro={erroFormulario}
        aoFechar={() => setFormulario(null)}
        aoSalvar={salvar}
      />
      <MateriaAcoesModal
        visivel={acoes !== null}
        materia={acoes}
        aoFechar={() => setAcoes(null)}
        aoEditar={() => {
          if (acoes) abrirFormulario({ materia: acoes });
          setAcoes(null);
        }}
        aoExcluir={() => {
          setConfirmarExclusao(acoes);
          setAcoes(null);
        }}
      />
      <SelecionarMateriaModal
        visivel={vazioTocado !== null}
        materias={materias}
        materiaSelecionadaId={null}
        aoFechar={() => setVazioTocado(null)}
        aoSelecionar={escolherMateriaParaHorario}
      />
      <ConfirmModal
        visivel={confirmarExclusao !== null}
        titulo={`Excluir ${confirmarExclusao?.nome ?? ''}?`}
        mensagem="Isso apaga também todas as avaliações e aulas fixas dessa matéria. Não dá pra desfazer."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={confirmarExclusaoMateria}
        aoCancelar={() => setConfirmarExclusao(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
    gap: spacing.md,
  },
  linhaBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  busca: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
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
  contagem: {
    flex: 1,
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  alternancia: {
    width: 116,
  },
  dica: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  semResultado: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  grupo: {
    gap: spacing.sm,
  },
  grupoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  vazioIcone: {
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl - 4,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    ...shadow.floating,
  },
  fabPressionado: {
    opacity: 0.85,
  },
  fabTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14.5,
    color: colors.surface,
  },
});
