import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacaoForm } from '../../../src/components/avaliacoes/AvaliacaoForm';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import {
  deleteAvaliacao,
  getAvaliacao,
  NovaAvaliacao,
  updateAvaliacao,
} from '../../../src/domain/avaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function DetalheAvaliacaoScreen() {
  const { id, semestreId } = useLocalSearchParams<{
    id: string;
    semestreId: string;
  }>();
  const avaliacaoId = Number(id);
  const semestreIdNum = Number(semestreId);

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const avaliacao = getAvaliacao(avaliacaoId);
  const { data: materias = [] } = useMateriasPorSemestre(semestreIdNum);

  const mutacaoSalvar = useMutation({
    mutationFn: (dados: NovaAvaliacao) =>
      Promise.resolve(updateAvaliacao(avaliacaoId, dados)),
    onSuccess: () => router.back(),
  });

  const mutacaoExcluir = useMutation({
    mutationFn: () => Promise.resolve(deleteAvaliacao(avaliacaoId)),
    onSuccess: () => router.back(),
  });

  if (!avaliacao) {
    return (
      <SafeAreaView style={styles.vazio} edges={['top']}>
        <Text style={styles.vazioTexto}>Avaliação não encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
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
        onPress={() => setConfirmarExclusao(true)}
        disabled={mutacaoExcluir.isPending}
      >
        <Text style={styles.botaoExcluirTexto}>
          {mutacaoExcluir.isPending ? 'Excluindo…' : 'Excluir avaliação'}
        </Text>
      </Pressable>
      <ConfirmModal
        visivel={confirmarExclusao}
        titulo="Excluir essa avaliação?"
        mensagem="Ela some da lista e da timeline, junto com a nota lançada. Não dá pra desfazer."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={() => {
          setConfirmarExclusao(false);
          mutacaoExcluir.mutate();
        }}
        aoCancelar={() => setConfirmarExclusao(false)}
      />
    </SafeAreaView>
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
