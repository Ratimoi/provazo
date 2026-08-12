import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventoUnicoForm } from '../../../../src/components/timeline/EventoUnicoForm';
import {
  deleteEventoUnico,
  getEventoUnico,
  NovoEventoUnico,
  updateEventoUnico,
} from '../../../../src/domain/eventosUnicos';
import { compromissosQueryKey } from '../../../../src/hooks/useCompromissosDoDia';
import { colors, font, spacing } from '../../../../src/theme/tokens';

export default function DetalheEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventoId = Number(id);
  const queryClient = useQueryClient();

  const evento = getEventoUnico(eventoId);

  const mutacaoSalvar = useMutation({
    mutationFn: (dados: NovoEventoUnico) =>
      Promise.resolve(updateEventoUnico(eventoId, dados)),
    onSuccess: (_atualizado, dados) => {
      queryClient.invalidateQueries({
        queryKey: compromissosQueryKey(dados.data),
      });
      router.back();
    },
  });

  const mutacaoExcluir = useMutation({
    mutationFn: () => Promise.resolve(deleteEventoUnico(eventoId)),
    onSuccess: () => {
      if (evento) {
        queryClient.invalidateQueries({
          queryKey: compromissosQueryKey(evento.data),
        });
      }
      router.back();
    },
  });

  if (!evento) {
    return (
      <SafeAreaView style={styles.vazio} edges={['top']}>
        <Text style={styles.vazioTexto}>Compromisso não encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <EventoUnicoForm
        dataInicial={evento.data}
        rotuloBotao="Salvar alterações"
        valorInicial={{
          titulo: evento.titulo,
          data: evento.data,
          horaInicio: evento.horaInicio,
          horaFim: evento.horaFim ?? '',
          corHex: evento.corHex,
        }}
        aoSalvar={(dados) => mutacaoSalvar.mutate(dados)}
      />
      <Pressable
        style={styles.botaoExcluir}
        onPress={() => mutacaoExcluir.mutate()}
        disabled={mutacaoExcluir.isPending}
      >
        <Text style={styles.botaoExcluirTexto}>
          {mutacaoExcluir.isPending ? 'Excluindo…' : 'Excluir compromisso'}
        </Text>
      </Pressable>
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
