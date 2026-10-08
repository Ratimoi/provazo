import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EventoUnicoForm,
  type Repeticao,
} from '../../../../../src/components/timeline/EventoUnicoForm';
import { CabecalhoTela } from '../../../../../src/components/ui/CabecalhoTela';
import { ConfirmModal } from '../../../../../src/components/ui/ConfirmModal';
import {
  deleteEventoRecorrente,
  getEventoRecorrente,
  updateEventoRecorrentePessoal,
} from '../../../../../src/domain/eventosRecorrentes';
import type { NovoEventoUnico } from '../../../../../src/domain/eventosUnicos';
import { colors, font, spacing } from '../../../../../src/theme/tokens';

export default function DetalheRecorrenteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventoId = Number(id);
  const evento = getEventoRecorrente(eventoId);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const mutacaoSalvar = useMutation({
    mutationFn: (variaveis: {
      dados: NovoEventoUnico;
      repeticao: Repeticao;
      diasSemana: number[];
    }) =>
      Promise.resolve(
        updateEventoRecorrentePessoal(eventoId, {
          titulo: variaveis.dados.titulo,
          corHex: variaveis.dados.corHex,
          // O formulário oferece "Nunca", mas aqui o evento já é recorrente:
          // nesse caso mantém semanal em vez de converter para avulso.
          frequencia:
            variaveis.repeticao === 'nunca' ? 'semanal' : variaveis.repeticao,
          dataBase: variaveis.dados.data,
          diasSemana: variaveis.diasSemana,
          horaInicio: variaveis.dados.horaInicio,
          horaFim: variaveis.dados.horaFim ?? null,
          observacoes: variaveis.dados.observacoes ?? null,
        }),
      ),
    onSuccess: () => router.back(),
  });

  const mutacaoExcluir = useMutation({
    mutationFn: () => Promise.resolve(deleteEventoRecorrente(eventoId)),
    onSuccess: () => router.back(),
  });

  if (!evento || evento.tipo === 'aula') {
    return (
      <SafeAreaView style={styles.telaVazia} edges={['top']}>
        <CabecalhoTela titulo="Compromisso" />
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Compromisso não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <CabecalhoTela titulo="Editar compromisso" />
      <EventoUnicoForm
        dataInicial={evento.dataBase}
        rotuloBotao="Salvar alterações"
        permiteRepetir
        repeticaoInicial={evento.frequencia}
        diasSemanaIniciais={evento.diasSemana}
        valorInicial={{
          titulo: evento.titulo,
          data: evento.dataBase,
          horaInicio: evento.horaInicio,
          horaFim: evento.horaFim ?? '',
          corHex: evento.corHex ?? undefined,
          observacoes: evento.observacoes ?? '',
        }}
        aoSalvar={(dados, repeticao, diasSemana) =>
          mutacaoSalvar.mutate({ dados, repeticao, diasSemana })
        }
      />
      <Pressable
        style={styles.botaoExcluir}
        onPress={() => setConfirmarExclusao(true)}
        disabled={mutacaoExcluir.isPending}
      >
        <Text style={styles.botaoExcluirTexto}>Excluir compromisso</Text>
      </Pressable>
      <ConfirmModal
        visivel={confirmarExclusao}
        titulo="Excluir esse compromisso?"
        mensagem="Todas as ocorrências dele somem da timeline. Não dá pra desfazer."
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
  telaVazia: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
