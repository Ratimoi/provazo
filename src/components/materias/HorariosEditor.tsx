import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  type Horario,
  duracaoEmMinutos,
  somarMinutos,
  validarHorario,
} from '../../domain/horarios';
import { listHorariosUsados } from '../../domain/apoioSeletores';
import { horaValida } from '../../domain/validacao';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { CampoToque } from '../ui/CampoToque';
import { DURACOES_AULA, DuracaoChips } from '../ui/DuracaoChips';
import { HoraPicker } from '../ui/HoraPicker';

/** Horário de aula em edição; `chave` identifica a linha na lista (o `id` do banco só existe se já foi salvo). */
export type HorarioRascunho = Horario & {
  chave: string;
  id?: number;
  observacoes: string;
};

const DIAS = [
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
  { valor: 0, rotulo: 'Dom' },
];

const NOME_DIA: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

let contador = 0;
export function novaChave(): string {
  contador += 1;
  return `h${contador}`;
}

type NovoHorario = {
  diaSemana: number | null;
  horaInicio: string;
  horaFim: string;
  observacoes: string;
};

const NOVO_VAZIO: NovoHorario = {
  diaSemana: null,
  horaInicio: '',
  horaFim: '',
  observacoes: '',
};

/**
 * Lista os horários de aula da matéria e tem um editor embutido pra adicionar
 * mais, com dia em chips, hora por seletor e fim calculado pela duração.
 */
export function HorariosEditor({
  horarios,
  aoMudar,
  avisosDeConflito,
  diaInicial,
  horaInicial,
}: {
  horarios: HorarioRascunho[];
  aoMudar: (horarios: HorarioRascunho[]) => void;
  /** Mensagens de sobreposição (não bloqueiam, só avisam). */
  avisosDeConflito: string[];
  /** Pré-preenche o editor (toque num horário livre da grade). */
  diaInicial?: number | null;
  horaInicial?: string;
}) {
  const [novo, setNovo] = useState<NovoHorario>(() => ({
    ...NOVO_VAZIO,
    diaSemana: diaInicial ?? null,
    horaInicio: horaInicial ?? '',
    horaFim: horaInicial && horaValida(horaInicial) ? somarMinutos(horaInicial, 100) : '',
  }));
  const [seletor, setSeletor] = useState<'inicio' | 'fim' | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  // Chave do horário carregado no editor pra alteração; null = adicionando um novo.
  const [editandoChave, setEditandoChave] = useState<string | null>(null);

  function abrirSeletor(qual: 'inicio' | 'fim') {
    setSugestoes(listHorariosUsados());
    setSeletor(qual);
  }

  function escolherHora(hora: string) {
    if (seletor === 'inicio') {
      // Se já havia um fim, mantém a mesma duração; senão sugere 1h40 (2 aulas de 50 min).
      const duracao =
        horaValida(novo.horaInicio) && horaValida(novo.horaFim)
          ? duracaoEmMinutos(novo.horaInicio, novo.horaFim)
          : 100;
      setNovo((n) => ({
        ...n,
        horaInicio: hora,
        horaFim: duracao > 0 ? somarMinutos(hora, duracao) : somarMinutos(hora, 100),
      }));
    } else {
      setNovo((n) => ({ ...n, horaFim: hora }));
    }
    setSeletor(null);
  }

  function adicionar() {
    if (novo.diaSemana == null) {
      setErro('Escolha o dia da semana.');
      return;
    }
    const erroHorario = validarHorario({
      diaSemana: novo.diaSemana,
      horaInicio: novo.horaInicio,
      horaFim: novo.horaFim,
    });
    if (erroHorario) {
      setErro(erroHorario);
      return;
    }
    setErro(null);
    const dados = {
      diaSemana: novo.diaSemana,
      horaInicio: novo.horaInicio,
      horaFim: novo.horaFim,
      observacoes: novo.observacoes.trim(),
    };
    if (editandoChave) {
      // Mantém a chave e o id do banco: é uma alteração, não um horário novo.
      aoMudar(horarios.map((h) => (h.chave === editandoChave ? { ...h, ...dados } : h)));
    } else {
      aoMudar([...horarios, { chave: novaChave(), ...dados }]);
    }
    // Volta ao editor vazio, pronto pro próximo horário.
    setEditandoChave(null);
    setNovo(NOVO_VAZIO);
  }

  /** Carrega um horário já salvo no editor, pra mudar dia, hora ou sala. */
  function editar(horario: HorarioRascunho) {
    setEditandoChave(horario.chave);
    setNovo({
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim,
      observacoes: horario.observacoes,
    });
    setErro(null);
  }

  function cancelarEdicao() {
    setEditandoChave(null);
    setNovo(NOVO_VAZIO);
    setErro(null);
  }

  function remover(chave: string) {
    if (chave === editandoChave) cancelarEdicao();
    aoMudar(horarios.filter((x) => x.chave !== chave));
  }

  const duracaoAtual =
    horaValida(novo.horaInicio) && horaValida(novo.horaFim)
      ? duracaoEmMinutos(novo.horaInicio, novo.horaFim)
      : null;

  return (
    <View style={styles.container}>
      {horarios.map((h) => (
        <Pressable
          key={h.chave}
          onPress={() => editar(h)}
          onLongPress={() => editar(h)}
          delayLongPress={350}
          style={[styles.linha, h.chave === editandoChave && styles.linhaEditando]}
          accessibilityLabel={`Editar horário de ${NOME_DIA[h.diaSemana]}, ${h.horaInicio} a ${h.horaFim}`}
        >
          <View style={styles.dia}>
            <Text style={styles.diaTexto}>{NOME_DIA[h.diaSemana].slice(0, 3)}</Text>
          </View>
          <View style={styles.linhaTextos}>
            <Text style={styles.linhaHora}>
              {h.horaInicio} – {h.horaFim}
            </Text>
            {h.observacoes ? (
              <Text style={styles.linhaObs} numberOfLines={1}>
                {h.observacoes}
              </Text>
            ) : null}
          </View>
          <Ionicons name="create-outline" size={18} color={colors.inkSoft} />
          <Pressable hitSlop={10} onPress={() => remover(h.chave)}>
            <Ionicons name="close" size={20} color={colors.inkSoft} />
          </Pressable>
        </Pressable>
      ))}

      <View style={styles.editor}>
        <Text style={styles.editorTitulo}>
          {editandoChave
            ? 'Editando horário'
            : horarios.length === 0
              ? 'Horário da aula'
              : 'Novo horário'}
        </Text>

        <View style={styles.chipsDias}>
          {DIAS.map((d) => {
            const ativo = novo.diaSemana === d.valor;
            return (
              <Pressable
                key={d.valor}
                onPress={() => setNovo((n) => ({ ...n, diaSemana: d.valor }))}
                style={[styles.chipDia, ativo && styles.chipDiaAtivo]}
              >
                <Text style={[styles.chipDiaTexto, ativo && styles.chipDiaTextoAtivo]}>
                  {d.rotulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.linhaHoras}>
          <CampoToque
            rotulo="Início"
            valor={novo.horaInicio}
            placeholder="--:--"
            grande
            aoPressionar={() => abrirSeletor('inicio')}
          />
          <CampoToque
            rotulo="Fim"
            valor={novo.horaFim}
            placeholder="--:--"
            grande
            aoPressionar={() => abrirSeletor('fim')}
          />
        </View>

        {horaValida(novo.horaInicio) && (
          <DuracaoChips
            opcoes={DURACOES_AULA}
            minutosAtuais={duracaoAtual}
            aoEscolher={(min) =>
              setNovo((n) => ({ ...n, horaFim: somarMinutos(n.horaInicio, min) }))
            }
            aoPersonalizar={() => abrirSeletor('fim')}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Sala, prédio… (opcional)"
          placeholderTextColor={colors.inkSoft}
          value={novo.observacoes}
          onChangeText={(v) => setNovo((n) => ({ ...n, observacoes: v }))}
        />

        {erro && <Text style={styles.erro}>{erro}</Text>}
        {avisosDeConflito.map((aviso) => (
          <Text key={aviso} style={styles.aviso}>
            {aviso}
          </Text>
        ))}

        <Pressable style={styles.botaoAdicionar} onPress={adicionar}>
          <Ionicons name={editandoChave ? 'checkmark' : 'add'} size={18} color={colors.brand} />
          <Text style={styles.botaoAdicionarTexto}>
            {editandoChave ? 'Atualizar horário' : 'Adicionar horário'}
          </Text>
        </Pressable>
        {editandoChave && (
          <Pressable style={styles.botaoCancelarEdicao} onPress={cancelarEdicao}>
            <Text style={styles.botaoCancelarEdicaoTexto}>Cancelar alteração</Text>
          </Pressable>
        )}
      </View>

      <HoraPicker
        visivel={seletor !== null}
        titulo={seletor === 'fim' ? 'Fim da aula' : 'Início da aula'}
        subtitulo={novo.diaSemana != null ? NOME_DIA[novo.diaSemana] : undefined}
        valor={seletor === 'fim' ? novo.horaFim : novo.horaInicio}
        sugestoes={sugestoes}
        aoFechar={() => setSeletor(null)}
        aoConfirmar={escolherHora}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md + 2,
    padding: spacing.md - 2,
    ...shadow.card,
  },
  linhaEditando: {
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  botaoCancelarEdicao: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelarEdicaoTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  dia: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.brand,
  },
  linhaTextos: {
    flex: 1,
  },
  linhaHora: {
    fontFamily: font.bodySemibold,
    fontSize: 15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  linhaObs: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  editor: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.brand,
    padding: spacing.md,
    gap: spacing.md,
  },
  editorTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.brand,
  },
  chipsDias: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  chipDia: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDiaAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipDiaTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  chipDiaTextoAtivo: {
    color: colors.surface,
  },
  linhaHoras: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: font.body,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  erro: {
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.danger,
  },
  aviso: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  botaoAdicionar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  botaoAdicionarTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14.5,
    color: colors.brand,
  },
});
