import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CORES_TIPO } from '../../domain/cores';
import type { NovoEventoUnico } from '../../domain/eventosUnicos';
import type { FrequenciaRecorrencia } from '../../domain/eventosRecorrentes';
import { PALETA_MATERIAS } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { DataInput } from '../ui/DataInput';
import { HoraInput } from '../ui/HoraInput';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

export type Repeticao = 'nunca' | FrequenciaRecorrencia;

const OPCOES_REPETICAO: { valor: Repeticao; rotulo: string }[] = [
  { valor: 'nunca', rotulo: 'Nunca' },
  { valor: 'semanal', rotulo: 'Toda semana' },
  { valor: 'mensal', rotulo: 'Todo mês' },
  { valor: 'anual', rotulo: 'Todo ano' },
];

const DIAS = [
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
  { valor: 0, rotulo: 'Dom' },
];

export type ValorFormularioEvento = {
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  corHex: string;
  observacoes: string;
};

export function EventoUnicoForm({
  dataInicial,
  valorInicial,
  rotuloBotao = 'Salvar',
  permiteRepetir = false,
  aoSalvar,
}: {
  dataInicial: string;
  valorInicial?: Partial<ValorFormularioEvento>;
  rotuloBotao?: string;
  /** Mostra o seletor "Repetir" — só faz sentido ao criar um compromisso novo. */
  permiteRepetir?: boolean;
  aoSalvar: (
    dados: NovoEventoUnico,
    repeticao: Repeticao,
    diasSemana: number[],
  ) => void;
}) {
  const [valor, setValor] = useState<ValorFormularioEvento>({
    titulo: '',
    data: dataInicial,
    horaInicio: '',
    horaFim: '',
    corHex: CORES_TIPO.pessoal,
    observacoes: '',
    ...valorInicial,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [repeticao, setRepeticao] = useState<Repeticao>('nunca');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);

  function atualizar<K extends keyof ValorFormularioEvento>(
    campo: K,
    novoValor: ValorFormularioEvento[K],
  ) {
    setValor((atual) => ({ ...atual, [campo]: novoValor }));
  }

  function alternarDia(dia: number) {
    setDiasSemana((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia],
    );
  }

  function handleSalvar() {
    if (valor.titulo.trim().length === 0) {
      setErro('Dê um título pra esse compromisso.');
      return;
    }
    if (repeticao === 'semanal') {
      if (diasSemana.length === 0) {
        setErro('Escolha pelo menos um dia da semana.');
        return;
      }
    } else if (!REGEX_DATA.test(valor.data)) {
      setErro('Data inválida — use o formato AAAA-MM-DD.');
      return;
    }
    if (!REGEX_HORA.test(valor.horaInicio)) {
      setErro('Hora de início inválida — use o formato HH:MM.');
      return;
    }
    if (valor.horaFim && !REGEX_HORA.test(valor.horaFim)) {
      setErro('Hora de fim inválida — use o formato HH:MM.');
      return;
    }
    setErro(null);
    aoSalvar(
      {
        titulo: valor.titulo.trim(),
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim || null,
        corHex: valor.corHex,
        observacoes: valor.observacoes.trim() || null,
      },
      repeticao,
      diasSemana,
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.rotulo}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Novo compromisso"
        value={valor.titulo}
        onChangeText={(v) => atualizar('titulo', v)}
        autoFocus
      />

      {permiteRepetir && (
        <>
          <Text style={styles.rotulo}>Repetir</Text>
          <View style={styles.chips}>
            {OPCOES_REPETICAO.map((opcao) => {
              const selecionada = opcao.valor === repeticao;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setRepeticao(opcao.valor)}
                  style={[styles.chip, selecionada && styles.chipAtivoNeutro]}
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      selecionada && styles.chipTextoAtivo,
                    ]}
                  >
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {repeticao === 'semanal' ? (
        <>
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
                    style={[
                      styles.chipTexto,
                      selecionado && styles.chipTextoAtivo,
                    ]}
                  >
                    {d.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.rotulo}>Data</Text>
          <DataInput
            style={styles.input}
            value={valor.data}
            onChangeText={(v) => atualizar('data', v)}
          />
        </>
      )}

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Início</Text>
          <HoraInput
            style={styles.input}
            value={valor.horaInicio}
            onChangeText={(v) => atualizar('horaInicio', v)}
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Fim (opcional)</Text>
          <HoraInput
            style={styles.input}
            value={valor.horaFim}
            onChangeText={(v) => atualizar('horaFim', v)}
          />
        </View>
      </View>

      <Text style={styles.rotulo}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textoMultilinha]}
        placeholder="Observações"
        value={valor.observacoes}
        onChangeText={(v) => atualizar('observacoes', v)}
        multiline
      />

      <Text style={styles.rotulo}>Cor</Text>
      <View style={styles.cores}>
        {PALETA_MATERIAS.map((cor) => (
          <Pressable
            key={cor}
            onPress={() => atualizar('corHex', cor)}
            style={[
              styles.corSwatch,
              { backgroundColor: cor },
              valor.corHex === cor && styles.corSwatchSelecionada,
            ]}
          />
        ))}
      </View>

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable style={styles.botaoSalvar} onPress={handleSalvar}>
        <Text style={styles.botaoSalvarTexto}>{rotuloBotao}</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.xs,
    paddingBottom: 48,
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
    minHeight: 80,
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
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  corSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchSelecionada: {
    borderColor: colors.ink,
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
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
