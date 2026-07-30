import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';

import { EventoUnicoForm } from '../../../../src/components/timeline/EventoUnicoForm';
import { createEventoUnico, NovoEventoUnico } from '../../../../src/domain/eventosUnicos';
import { compromissosQueryKey } from '../../../../src/hooks/useCompromissosDoDia';

export default function NovoEventoScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const queryClient = useQueryClient();

  const mutacao = useMutation({
    mutationFn: (dados: NovoEventoUnico) =>
      Promise.resolve(createEventoUnico(dados)),
    onSuccess: (_novo, dados) => {
      queryClient.invalidateQueries({
        queryKey: compromissosQueryKey(dados.data),
      });
      router.back();
    },
  });

  return (
    <EventoUnicoForm
      dataInicial={data}
      rotuloBotao="Criar compromisso"
      aoSalvar={(dados) => mutacao.mutate(dados)}
    />
  );
}
