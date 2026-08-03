import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AvaliacaoForm } from '../../../src/components/avaliacoes/AvaliacaoForm';
import { createAvaliacao, NovaAvaliacao } from '../../../src/domain/avaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { avaliacoesQueryKey } from '../../../src/hooks/useAvaliacoes';
import { mediasQueryKey } from '../../../src/hooks/useMediasPorMateria';
import { colors, font } from '../../../src/theme/tokens';

export default function NovaAvaliacaoScreen() {
  const { semestreId } = useLocalSearchParams<{ semestreId: string }>();
  const semestreIdNum = Number(semestreId);
  const queryClient = useQueryClient();

  const { data: materias = [] } = useMateriasPorSemestre(semestreIdNum);

  const mutacao = useMutation({
    mutationFn: (dados: NovaAvaliacao) => Promise.resolve(createAvaliacao(dados)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: avaliacoesQueryKey(semestreIdNum),
      });
      queryClient.invalidateQueries({ queryKey: mediasQueryKey(semestreIdNum) });
      router.back();
    },
  });

  if (materias.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTexto}>
          Crie uma matéria antes de adicionar uma avaliação.
        </Text>
      </View>
    );
  }

  return (
    <AvaliacaoForm
      materias={materias}
      rotuloBotao="Criar avaliação"
      aoSalvar={(dados) => mutacao.mutate(dados)}
    />
  );
}

const styles = StyleSheet.create({
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.bg,
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
