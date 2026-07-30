import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createMateria, PALETA_MATERIAS } from '../../../src/domain/materias';
import { materiasQueryKey } from '../../../src/hooks/useMaterias';

export default function NovaMateriaScreen() {
  const { semestreId } = useLocalSearchParams<{ semestreId: string }>();
  const semestreIdNum = Number(semestreId);
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [corSelecionada, setCorSelecionada] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const mutacao = useMutation({
    mutationFn: () => {
      if (nome.trim().length === 0) {
        throw new Error('Dê um nome pra matéria.');
      }
      return Promise.resolve(
        createMateria(semestreIdNum, nome.trim(), corSelecionada ?? undefined),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: materiasQueryKey(semestreIdNum),
      });
      router.back();
    },
    onError: (e: Error) => setErro(e.message || 'Não foi possível salvar.'),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Nova matéria</Text>

      <Text style={styles.rotulo}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Cálculo 2"
        value={nome}
        onChangeText={setNome}
        autoFocus
      />

      <Text style={styles.rotulo}>Cor</Text>
      <View style={styles.cores}>
        {PALETA_MATERIAS.map((cor) => (
          <Pressable
            key={cor}
            onPress={() => setCorSelecionada(cor)}
            style={[
              styles.corSwatch,
              { backgroundColor: cor },
              corSelecionada === cor && styles.corSwatchSelecionada,
            ]}
          />
        ))}
      </View>

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable
        style={styles.botaoSalvar}
        onPress={() => mutacao.mutate()}
        disabled={mutacao.isPending}
      >
        <Text style={styles.botaoSalvarTexto}>
          {mutacao.isPending ? 'Salvando…' : 'Criar matéria'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 8,
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
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  corSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchSelecionada: {
    borderColor: '#18181B',
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
    marginTop: 24,
  },
  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
