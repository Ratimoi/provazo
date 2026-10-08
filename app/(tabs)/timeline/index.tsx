import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgendaVertical } from '../../../src/components/timeline/AgendaVertical';
import { RecorrenteAcoesModal } from '../../../src/components/timeline/RecorrenteAcoesModal';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import type { Compromisso } from '../../../src/domain/timeline';
import { getMateria } from '../../../src/domain/materias';
import {
  deleteEventoRecorrente,
  pularOcorrencia,
} from '../../../src/domain/eventosRecorrentes';
import { useCompromissosDoDia } from '../../../src/hooks/useCompromissosDoDia';
import { useDiaSelecionado } from '../../../src/hooks/useDiaSelecionado';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

export default function TimelineScreen() {
  const { data, dataIso, ehHoje, irParaAnterior, irParaProximo, irParaHoje } =
    useDiaSelecionado();
  const { data: compromissos = [] } = useCompromissosDoDia(dataIso);
  const [recorrenteSelecionado, setRecorrenteSelecionado] =
    useState<Compromisso | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  function abrirCompromisso(compromisso: Compromisso) {
    if (compromisso.origem === 'avaliacao') {
      const materia = compromisso.materiaId
        ? getMateria(compromisso.materiaId)
        : undefined;
      if (!materia) return;
      router.push({
        pathname: '/provas-trabalhos/[id]',
        params: {
          id: String(compromisso.origemId),
          semestreId: String(materia.semestreId),
        },
      });
    } else if (compromisso.origem === 'evento_unico') {
      router.push({
        pathname: '/timeline/evento/[id]',
        params: { id: String(compromisso.origemId) },
      });
    } else {
      setRecorrenteSelecionado(compromisso);
    }
  }

  function editarRecorrente() {
    if (!recorrenteSelecionado) return;
    router.push({
      pathname: '/timeline/evento/recorrente/[id]',
      params: { id: String(recorrenteSelecionado.origemId) },
    });
    setRecorrenteSelecionado(null);
  }

  function pularRecorrente() {
    if (!recorrenteSelecionado) return;
    pularOcorrencia(recorrenteSelecionado.origemId, dataIso);
    setRecorrenteSelecionado(null);
  }

  function irParaMaterias() {
    setRecorrenteSelecionado(null);
    router.navigate('/provas-trabalhos');
  }

  function confirmarExclusaoRecorrente() {
    if (recorrenteSelecionado) {
      deleteEventoRecorrente(recorrenteSelecionado.origemId);
    }
    setConfirmarExclusao(false);
    setRecorrenteSelecionado(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.seletor}>
          <Pressable onPress={irParaAnterior} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={colors.brand} />
          </Pressable>
          <Pressable onPress={irParaHoje} style={styles.dataContainer}>
            <Text style={styles.data}>
              {format(data, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </Text>
            {!ehHoje && <Text style={styles.voltarHoje}>voltar pra hoje</Text>}
          </Pressable>
          <Pressable onPress={irParaProximo} hitSlop={10}>
            <Ionicons name="chevron-forward" size={20} color={colors.brand} />
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.botaoNovo,
            pressed && styles.botaoPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/timeline/evento/novo',
              params: { data: dataIso },
            })
          }
        >
          <Ionicons name="add" size={18} color={colors.surface} />
        </Pressable>
      </View>

      <AgendaVertical
        compromissos={compromissos}
        ehHoje={ehHoje}
        onPressCompromisso={abrirCompromisso}
      />

      <RecorrenteAcoesModal
        visivel={recorrenteSelecionado !== null && !confirmarExclusao}
        compromisso={recorrenteSelecionado}
        aoFechar={() => setRecorrenteSelecionado(null)}
        aoEditar={editarRecorrente}
        aoPular={pularRecorrente}
        aoExcluir={() => setConfirmarExclusao(true)}
        aoIrParaMaterias={irParaMaterias}
      />
      <ConfirmModal
        visivel={confirmarExclusao}
        titulo="Excluir esse compromisso?"
        mensagem="Todas as ocorrências dele somem da timeline. Não dá pra desfazer."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={confirmarExclusaoRecorrente}
        aoCancelar={() => setConfirmarExclusao(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  dataContainer: {
    flex: 1,
  },
  data: {
    fontFamily: font.display,
    fontSize: 17,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  voltarHoje: {
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.brand,
  },
  botaoNovo: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  botaoPressed: {
    opacity: 0.85,
  },
});
