import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvaliacaoForm } from '../../../src/components/avaliacoes/AvaliacaoForm';
import {
  deleteAvaliacao,
  getAvaliacao,
  NovaAvaliacao,
  updateAvaliacao,
} from '../../../src/domain/avaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { avaliacoesQueryKey } from '../../../src/hooks/useAvaliacoes';
import { mediasQueryKey } from '../../../src/hooks/useMediasPorMateria';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function DetalheAvaliacaoScreen() {
  const { id, semestreId } = useLocalSearchParams<{
    id: string;
    semestreId: string;
  }>();
  const avaliacaoId = Number(id);
  const semestreIdNum = Number(semestreId);
  const queryClient = useQueryClient();

  const avaliacao = getAvaliacao(avaliacaoId);
  const { data: materias = [] } = useMateriasPorSemestre(semestreIdNum);

  const invalidar = () => {
    queryClient.invalidateQueries({
      queryKey: avaliacoesQueryKey(semestreIdNum),
    });
    queryClient.invalidateQueries({ queryKey: mediasQueryKey(semestreIdNum) });
  };

  const mutacaoSalvar = useMutation({
    mutationFn: (dados: NovaAvaliacao) =>
      Promise.resolve(updateAvaliacao(avaliacaoId, dados)),
    onSuccess: () => {
      invalidar();
      router.back();
    },
  });

  const mutacaoExcluir = useMutation({
    mutationFn: () => Promise.resolve(deleteAvaliacao(avaliacaoId)),
    onSuccess: () => {
      invalidar();
      router.back();
    },
  });

  if (!avaliacao) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTexto}>Avaliação não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AvaliacaoForm
        materias={materias}
        rotuloBotao="Salvar alterações"
        valorInicial={{
          materiaId: avaliacao.materiaId,
          tipo: avaliacao.tipo,
          titulo: avaliacao.titulo,
          data: avaliacao.data,
          hora: avaliacao.hora,
          peso: String(avaliacao.peso),
          nota: avaliacao.nota != null ? String(avaliacao.nota) : '',
          notaMaxima: String(avaliacao.notaMaxima),
          observacoes: avaliacao.observacoes ?? '',
        }}
        aoSalvar={(dados) => mutacaoSalvar.mutate(dados)}
      />
      <Pressable
        style={styles.botaoExcluir}
        onPress={() => mutacaoExcluir.mutate()}
        disabled={mutacaoExcluir.isPending}
      >
        <Text style={styles.botaoExcluirTexto}>
          {mutacaoExcluir.isPending ? 'Excluindo…' : 'Excluir avaliação'}
        </Text>
      </Pressable>
    </View>
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
  botaoExcluir: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botaoExcluirTexto: {
    fontFamily: font.bodySemibold,
    color: colors.danger,
    fontSize: 15,
  },
});
