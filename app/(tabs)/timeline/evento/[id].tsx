import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EventoUnicoForm } from '../../../../src/components/timeline/EventoUnicoForm';
import {
  deleteEventoUnico,
  getEventoUnico,
  NovoEventoUnico,
  updateEventoUnico,
} from '../../../../src/domain/eventosUnicos';
import { compromissosQueryKey } from '../../../../src/hooks/useCompromissosDoDia';

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
      <View style={styles.vazio}>
        <Text style={styles.vazioTexto}>Compromisso não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  vazioTexto: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
  },
  botaoExcluir: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoExcluirTexto: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
