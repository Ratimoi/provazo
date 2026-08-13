import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoTela } from '../../../../src/components/ui/CabecalhoTela';
import {
  EventoUnicoForm,
  type Repeticao,
} from '../../../../src/components/timeline/EventoUnicoForm';
import { createEventoUnico, NovoEventoUnico } from '../../../../src/domain/eventosUnicos';
import {
  createEventoRecorrentePessoal,
  type FrequenciaRecorrencia,
} from '../../../../src/domain/eventosRecorrentes';
import { compromissosQueryKey } from '../../../../src/hooks/useCompromissosDoDia';

export default function NovoEventoScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const queryClient = useQueryClient();

  const mutacaoUnico = useMutation({
    mutationFn: (dados: NovoEventoUnico) =>
      Promise.resolve(createEventoUnico(dados)),
    onSuccess: (_novo, dados) => {
      queryClient.invalidateQueries({
        queryKey: compromissosQueryKey(dados.data),
      });
      router.back();
    },
  });

  const mutacaoRecorrente = useMutation({
    mutationFn: (variaveis: {
      dados: NovoEventoUnico;
      frequencia: FrequenciaRecorrencia;
      diasSemana: number[];
    }) =>
      Promise.resolve(
        createEventoRecorrentePessoal({
          titulo: variaveis.dados.titulo,
          corHex: variaveis.dados.corHex,
          frequencia: variaveis.frequencia,
          dataBase: variaveis.dados.data,
          diasSemana: variaveis.diasSemana,
          horaInicio: variaveis.dados.horaInicio,
          horaFim: variaveis.dados.horaFim ?? null,
          observacoes: variaveis.dados.observacoes ?? null,
        }),
      ),
    onSuccess: (_novo, variaveis) => {
      queryClient.invalidateQueries({
        queryKey: compromissosQueryKey(variaveis.dados.data),
      });
      router.back();
    },
  });

  function handleSalvar(
    dados: NovoEventoUnico,
    repeticao: Repeticao,
    diasSemana: number[],
  ) {
    if (repeticao === 'nunca') {
      mutacaoUnico.mutate(dados);
    } else {
      mutacaoRecorrente.mutate({ dados, frequencia: repeticao, diasSemana });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <CabecalhoTela titulo="Novo compromisso" />
      <EventoUnicoForm
        dataInicial={data}
        rotuloBotao="Criar compromisso"
        permiteRepetir
        aoSalvar={handleSalvar}
      />
    </SafeAreaView>
  );
}
