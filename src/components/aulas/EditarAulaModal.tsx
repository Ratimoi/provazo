import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Aula, NovaAula } from '../../domain/eventosRecorrentes';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';
import { HoraInput } from '../ui/HoraInput';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const DIAS = [
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
  { valor: 0, rotulo: 'Dom' },
];

export function EditarAulaModal({
  visivel,
  aula,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: {
  visivel: boolean;
  aula: Aula | null;
  salvando?: boolean;
  erro?: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: NovaAula) => void;
}) {
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  // Toda abertura reflete a aula atual, mesmo cuidado do EditarMateriaModal.
  useEffect(() => {
    if (visivel && aula) {
      setDiasSemana(aula.diasSemana);
      setHoraInicio(aula.horaInicio);
      setHoraFim(aula.horaFim ?? '');
      setObservacoes(aula.observacoes ?? '');
      setErroLocal(null);
    }
  }, [visivel, aula]);

  function alternarDia(dia: number) {
    setDiasSemana((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia],
    );
  }

  if (!aula) return null;

  function handleSalvar() {
    if (!aula) return;
    if (diasSemana.length === 0) {
      setErroLocal('Escolha pelo menos um dia da semana.');
      return;
    }
    if (!REGEX_HORA.test(horaInicio)) {
      setErroLocal('Hora de início inválida — use o formato HH:MM.');
      return;
    }
    if (!REGEX_HORA.test(horaFim)) {
      setErroLocal('Hora de fim inválida — use o formato HH:MM.');
      return;
    }
    setErroLocal(null);
    aoSalvar({
      materiaId: aula.materiaId,
      titulo: aula.titulo,
      diasSemana,
      horaInicio,
      horaFim,
      observacoes: observacoes.trim() || null,
    });
  }

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <View style={styles.tituloLinha}>
          <View style={[styles.dot, { backgroundColor: aula.materiaCorHex }]} />
          <Text style={styles.titulo}>{aula.materiaNome}</Text>
        </View>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Cancelar</Text>
        </Pressable>
      </View>

      <Text style={styles.rotulo}>Dias da semana</Text>
      <View style={styles.chips}>
        {DIAS.map((d) => {
          const selecionado = diasSemana.includes(d.valor);
          return (
            <Pressable
              key={d.valor}
              onPress={() => alternarDia(d.valor)}
              style={[styles.chip, selecionado && styles.chipAtivoNeutro]}
            >
              <Text
                style={[styles.chipTexto, selecionado && styles.chipTextoAtivo]}
              >
                {d.rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Início</Text>
          <HoraInput
            style={styles.input}
            value={horaInicio}
            onChangeText={setHoraInicio}
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Fim</Text>
          <HoraInput
            style={styles.input}
            value={horaFim}
            onChangeText={setHoraFim}
          />
        </View>
      </View>

      <Text style={styles.rotulo}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textoMultilinha]}
        placeholder="Ex: sala 204, prédio B…"
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
      />

      {(erroLocal || erro) && (
        <Text style={styles.erro}>{erroLocal ?? erro}</Text>
      )}

      <Pressable
        style={styles.botaoSalvar}
        onPress={handleSalvar}
        disabled={salvando}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
  },
  fechar: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  textoMultilinha: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  linha: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metade: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipAtivoNeutro: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
  },
  erro: {
    fontFamily: font.bodyMedium,
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.md,
  },
  botaoSalvar: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadow.floating,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
