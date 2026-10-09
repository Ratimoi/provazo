import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Aula } from '../../domain/eventosRecorrentes';
import { encontrarConflitos, type Horario } from '../../domain/horarios';
import type { Materia } from '../../domain/materias';
import { PALETA_MATERIAS } from '../../domain/materias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { HorariosEditor, type HorarioRascunho, novaChave } from './HorariosEditor';

export type OutraAula = Horario & { materiaNome: string };

export type DadosDoFormulario = {
  nome: string;
  corHex: string;
  instituicao: string | null;
  horarios: HorarioRascunho[];
};

const NOME_DIA: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

function rascunhosDasAulas(aulas: Aula[]): HorarioRascunho[] {
  return aulas.flatMap((aula) =>
    aula.diasSemana.map((dia) => ({
      chave: novaChave(),
      id: aula.id,
      diaSemana: dia,
      horaInicio: aula.horaInicio,
      horaFim: aula.horaFim ?? aula.horaInicio,
      observacoes: aula.observacoes ?? '',
    })),
  );
}

/**
 * Tela cheia pra criar ou editar uma matéria já com todos os horários de aula:
 * nome, instituição, cor e horários num fluxo só.
 */
export function MateriaForm({
  visivel,
  materia,
  aulasDaMateria,
  outrasAulas,
  corPadrao,
  instituicoesSugeridas,
  diaInicial,
  horaInicial,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: {
  visivel: boolean;
  /** Matéria sendo editada; null cria uma nova. */
  materia: Materia | null;
  aulasDaMateria: Aula[];
  /** Aulas das outras matérias do semestre, pra avisar sobre sobreposição. */
  outrasAulas: OutraAula[];
  /** Cor sugerida pra uma matéria nova (a menos usada no semestre). */
  corPadrao: string;
  instituicoesSugeridas: string[];
  /** Pré-preenche o editor de horário (toque num horário livre da grade). */
  diaInicial?: number | null;
  horaInicial?: string;
  salvando?: boolean;
  erro?: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: DadosDoFormulario) => void;
}) {
  const [nome, setNome] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [corHex, setCorHex] = useState<string>(corPadrao);
  const [horarios, setHorarios] = useState<HorarioRascunho[]>([]);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  // Muda a cada abertura pra o editor de horários remontar com os valores iniciais certos.
  const [abertura, setAbertura] = useState(0);

  useEffect(() => {
    if (!visivel) return;
    setNome(materia?.nome ?? '');
    setInstituicao(materia?.instituicao ?? '');
    setCorHex(materia?.corHex ?? corPadrao);
    setHorarios(materia ? rascunhosDasAulas(aulasDaMateria) : []);
    setErroLocal(null);
    setAbertura((a) => a + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel]);

  const avisosDeConflito = useMemo(() => {
    const conflitos = encontrarConflitos(horarios, outrasAulas);
    const avisos = new Set<string>();
    for (const c of conflitos) {
      const h = horarios[c.novo];
      const quando = `${NOME_DIA[h.diaSemana]} ${h.horaInicio}–${h.horaFim}`;
      avisos.add(
        c.outro.origem === 'existente'
          ? `${quando} se sobrepõe a ${outrasAulas[c.outro.indice].materiaNome}.`
          : `${quando} se sobrepõe a outro horário desta matéria.`,
      );
    }
    return [...avisos];
  }, [horarios, outrasAulas]);

  function handleSalvar() {
    if (nome.trim().length === 0) {
      setErroLocal('Dê um nome pra matéria.');
      return;
    }
    setErroLocal(null);
    aoSalvar({
      nome: nome.trim(),
      corHex,
      instituicao: instituicao.trim() || null,
      horarios,
    });
  }

  const textoErro = erroLocal ?? erro;

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.cabecalho}>
            <Pressable onPress={aoFechar} hitSlop={10}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </Pressable>
            <Text style={styles.titulo}>
              {materia ? 'Editar matéria' : 'Nova matéria'}
            </Text>
            <View style={styles.espaco} />
          </View>

          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.rotulo}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nova matéria"
              placeholderTextColor={colors.inkSoft}
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.rotulo}>Instituição (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nova instituição"
              placeholderTextColor={colors.inkSoft}
              value={instituicao}
              onChangeText={setInstituicao}
            />
            {instituicoesSugeridas.length > 0 && (
              <View style={styles.chips}>
                {instituicoesSugeridas.map((sugestao) => {
                  const ativo = instituicao === sugestao;
                  return (
                    <Pressable
                      key={sugestao}
                      onPress={() => setInstituicao(sugestao)}
                      style={[styles.chip, ativo && styles.chipAtivo]}
                    >
                      <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                        {sugestao}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text style={styles.rotulo}>Cor</Text>
            <View style={styles.cores}>
              {PALETA_MATERIAS.map((cor) => (
                <Pressable
                  key={cor}
                  onPress={() => setCorHex(cor)}
                  hitSlop={4}
                  style={[
                    styles.corSwatch,
                    { backgroundColor: cor },
                    corHex === cor && styles.corSwatchSelecionada,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.rotulo}>Horários das aulas</Text>
            <HorariosEditor
              key={abertura}
              horarios={horarios}
              aoMudar={setHorarios}
              avisosDeConflito={avisosDeConflito}
              diaInicial={diaInicial}
              horaInicial={horaInicial}
            />

            {textoErro && <Text style={styles.erro}>{textoErro}</Text>}
          </ScrollView>

          <View style={styles.rodape}>
            <Pressable
              style={[styles.botaoSalvar, salvando && styles.botaoSalvarOcupado]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              <Text style={styles.botaoSalvarTexto}>
                {salvando ? 'Salvando…' : materia ? 'Salvar alterações' : 'Salvar matéria'}
              </Text>
              {horarios.length > 0 && !salvando && (
                <View style={styles.selo}>
                  <Text style={styles.seloTexto}>
                    {horarios.length} horário{horarios.length === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelar: {
    width: 64,
    fontFamily: font.bodyMedium,
    fontSize: 14.5,
    color: colors.inkSoft,
  },
  espaco: {
    width: 64,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 19,
    color: colors.ink,
  },
  conteudo: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
  },
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  corSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchSelecionada: {
    borderColor: colors.ink,
  },
  erro: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.danger,
    marginTop: spacing.md,
  },
  rodape: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  botaoSalvar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    borderRadius: radii.md + 4,
    backgroundColor: colors.brand,
    ...shadow.floating,
  },
  botaoSalvarOcupado: {
    opacity: 0.7,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 16,
    color: colors.surface,
  },
  selo: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  seloTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 12.5,
    color: colors.surface,
  },
});
