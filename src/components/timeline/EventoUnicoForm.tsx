import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CORES_TIPO } from '../../domain/cores';
import type { NovoEventoUnico } from '../../domain/eventosUnicos';
import { PALETA_MATERIAS } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ValorFormularioEvento = {
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  corHex: string;
};

export function EventoUnicoForm({
  dataInicial,
  valorInicial,
  rotuloBotao = 'Salvar',
  aoSalvar,
}: {
  dataInicial: string;
  valorInicial?: Partial<ValorFormularioEvento>;
  rotuloBotao?: string;
  aoSalvar: (dados: NovoEventoUnico) => void;
}) {
  const [valor, setValor] = useState<ValorFormularioEvento>({
    titulo: '',
    data: dataInicial,
    horaInicio: '',
    horaFim: '',
    corHex: CORES_TIPO.pessoal,
    ...valorInicial,
  });
  const [erro, setErro] = useState<string | null>(null);

  function atualizar<K extends keyof ValorFormularioEvento>(
    campo: K,
    novoValor: ValorFormularioEvento[K],
  ) {
    setValor((atual) => ({ ...atual, [campo]: novoValor }));
  }

  function handleSalvar() {
    if (valor.titulo.trim().length === 0) {
      setErro('Dê um título pra esse compromisso.');
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
    aoSalvar({
      titulo: valor.titulo.trim(),
      data: valor.data,
      horaInicio: valor.horaInicio,
      horaFim: valor.horaFim || null,
      corHex: valor.corHex,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.rotulo}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Consulta, reunião…"
        value={valor.titulo}
        onChangeText={(v) => atualizar('titulo', v)}
        autoFocus
      />

      <Text style={styles.rotulo}>Data</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        value={valor.data}
        onChangeText={(v) => atualizar('data', v)}
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Início</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            value={valor.horaInicio}
            onChangeText={(v) => atualizar('horaInicio', v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Fim (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            value={valor.horaFim}
            onChangeText={(v) => atualizar('horaFim', v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

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
  );
}

const styles = StyleSheet.create({
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
  linha: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metade: {
    flex: 1,
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
