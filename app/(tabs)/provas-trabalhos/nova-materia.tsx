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
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

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
    padding: spacing.lg,
    gap: spacing.xs,
    backgroundColor: colors.bg,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.sm,
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
    ...shadow.floating,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
