import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Materia } from '../../domain/materias';
import type { NovaAvaliacao } from '../../domain/avaliacoes';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { DataInput } from '../ui/DataInput';
import { HoraInput } from '../ui/HoraInput';

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ValorFormularioAvaliacao = {
  materiaId: number | null;
  tipo: 'prova' | 'trabalho';
  titulo: string;
  data: string;
  hora: string;
  peso: string;
  nota: string;
  notaMaxima: string;
  observacoes: string;
};

const VAZIO: ValorFormularioAvaliacao = {
  materiaId: null,
  tipo: 'prova',
  titulo: '',
  data: '',
  hora: '',
  peso: '1',
  nota: '',
  notaMaxima: '10',
  observacoes: '',
};

export function AvaliacaoForm({
  materias,
  valorInicial,
  rotuloBotao = 'Salvar',
  aoSalvar,
}: {
  materias: Materia[];
  valorInicial?: Partial<ValorFormularioAvaliacao>;
  rotuloBotao?: string;
  aoSalvar: (dados: NovaAvaliacao) => void;
}) {
  const [valor, setValor] = useState<ValorFormularioAvaliacao>({
    ...VAZIO,
    materiaId: materias[0]?.id ?? null,
    ...valorInicial,
  });
  const [erro, setErro] = useState<string | null>(null);

  function atualizar<K extends keyof ValorFormularioAvaliacao>(
    campo: K,
    novoValor: ValorFormularioAvaliacao[K],
  ) {
    setValor((atual) => ({ ...atual, [campo]: novoValor }));
  }

  function validar(): NovaAvaliacao | null {
    if (valor.materiaId == null) {
      setErro('Escolha uma matéria.');
      return null;
    }
    if (valor.titulo.trim().length === 0) {
      setErro('Dê um título pra essa avaliação.');
      return null;
    }
    if (!REGEX_DATA.test(valor.data)) {
      setErro('Data inválida — use o formato AAAA-MM-DD.');
      return null;
    }
    if (!REGEX_HORA.test(valor.hora)) {
      setErro('Hora inválida — use o formato HH:MM.');
      return null;
    }
    const peso = Number(valor.peso.replace(',', '.'));
    if (!Number.isFinite(peso) || peso <= 0) {
      setErro('O peso precisa ser maior que zero.');
      return null;
    }
    const notaMaxima = Number(valor.notaMaxima.replace(',', '.'));
    if (!Number.isFinite(notaMaxima) || notaMaxima <= 0) {
      setErro('A nota máxima precisa ser maior que zero.');
      return null;
    }
    let nota: number | null = null;
    if (valor.nota.trim().length > 0) {
      nota = Number(valor.nota.replace(',', '.'));
      if (!Number.isFinite(nota)) {
        setErro('Nota inválida.');
        return null;
      }
    }

    setErro(null);
    return {
      materiaId: valor.materiaId,
      tipo: valor.tipo,
      titulo: valor.titulo.trim(),
      data: valor.data,
      hora: valor.hora,
      peso,
      nota,
      notaMaxima,
      diasAntesLembrete: 1,
      observacoes: valor.observacoes.trim() || null,
    };
  }

  function handleSalvar() {
    const dados = validar();
    if (dados) aoSalvar(dados);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.rotulo}>Matéria</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {materias.map((materia) => {
            const selecionada = materia.id === valor.materiaId;
            return (
              <Pressable
                key={materia.id}
                onPress={() => atualizar('materiaId', materia.id)}
                style={[
                  styles.chip,
                  selecionada && {
                    backgroundColor: materia.corHex,
                    borderColor: materia.corHex,
                  },
                ]}
              >
                <Text
                  style={[styles.chipTexto, selecionada && styles.chipTextoAtivo]}
                >
                  {materia.nome}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.rotulo}>Tipo</Text>
      <View style={styles.chips}>
        {(['prova', 'trabalho'] as const).map((tipo) => {
          const selecionado = tipo === valor.tipo;
          return (
            <Pressable
              key={tipo}
              onPress={() => atualizar('tipo', tipo)}
              style={[styles.chip, selecionado && styles.chipAtivoNeutro]}
            >
              <Text
                style={[styles.chipTexto, selecionado && styles.chipTextoAtivo]}
              >
                {tipo === 'prova' ? 'Prova' : 'Trabalho'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.rotulo}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: P1, Trabalho final…"
        value={valor.titulo}
        onChangeText={(v) => atualizar('titulo', v)}
      />

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Data</Text>
          <DataInput
            style={styles.input}
            value={valor.data}
            onChangeText={(v) => atualizar('data', v)}
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Hora</Text>
          <HoraInput
            style={styles.input}
            value={valor.hora}
            onChangeText={(v) => atualizar('hora', v)}
          />
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Peso</Text>
          <TextInput
            style={styles.input}
            value={valor.peso}
            onChangeText={(v) => atualizar('peso', v)}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Nota máxima</Text>
          <TextInput
            style={styles.input}
            value={valor.notaMaxima}
            onChangeText={(v) => atualizar('notaMaxima', v)}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={styles.rotulo}>Nota (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Deixe em branco se ainda não saiu"
        value={valor.nota}
        onChangeText={(v) => atualizar('nota', v)}
        keyboardType="decimal-pad"
      />

      <Text style={styles.rotulo}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textoMultilinha]}
        value={valor.observacoes}
        onChangeText={(v) => atualizar('observacoes', v)}
        multiline
      />

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
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
