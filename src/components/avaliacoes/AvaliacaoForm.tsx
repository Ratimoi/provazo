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
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            value={valor.data}
            onChangeText={(v) => atualizar('data', v)}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.metade}>
          <Text style={styles.rotulo}>Hora</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            value={valor.hora}
            onChangeText={(v) => atualizar('hora', v)}
            keyboardType="numbers-and-punctuation"
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
    padding: 16,
    gap: 8,
    paddingBottom: 48,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#18181B',
    backgroundColor: '#FFFFFF',
  },
  textoMultilinha: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  metade: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
  },
  chipAtivoNeutro: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
  },
  erro: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 12,
  },
  botaoSalvar: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
