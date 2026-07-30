import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CompromissoListItem } from '../../../src/components/timeline/CompromissoListItem';
import { TimelineStrip } from '../../../src/components/timeline/TimelineStrip';
import type { Compromisso } from '../../../src/domain/timeline';
import { getMateria } from '../../../src/domain/materias';
import { useCompromissosDoDia } from '../../../src/hooks/useCompromissosDoDia';
import { useDiaSelecionado } from '../../../src/hooks/useDiaSelecionado';

export default function TimelineScreen() {
  const { data, dataIso, ehHoje, irParaAnterior, irParaProximo, irParaHoje } =
    useDiaSelecionado();
  const { data: compromissos = [] } = useCompromissosDoDia(dataIso);

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
    } else {
      router.push({
        pathname: '/timeline/evento/[id]',
        params: { id: String(compromisso.origemId) },
      });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.seletor}>
          <Pressable onPress={irParaAnterior} hitSlop={12}>
            <Text style={styles.seta}>‹</Text>
          </Pressable>
          <Pressable onPress={irParaHoje} style={styles.dataContainer}>
            <Text style={styles.data}>
              {format(data, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </Text>
            {!ehHoje && <Text style={styles.voltarHoje}>voltar pra hoje</Text>}
          </Pressable>
          <Pressable onPress={irParaProximo} hitSlop={12}>
            <Text style={styles.seta}>›</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.botaoNovo}
          onPress={() =>
            router.push({
              pathname: '/timeline/evento/novo',
              params: { data: dataIso },
            })
          }
        >
          <Text style={styles.botaoNovoTexto}>+ Compromisso</Text>
        </Pressable>
      </View>

      <TimelineStrip
        compromissos={compromissos}
        onPressCompromisso={abrirCompromisso}
      />

      {compromissos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nada marcado para esse dia.</Text>
        </View>
      ) : (
        <FlatList
          data={compromissos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <CompromissoListItem
              compromisso={item}
              onPress={() => abrirCompromisso(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  seta: {
    fontSize: 22,
    color: '#4F46E5',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  dataContainer: {
    flex: 1,
  },
  data: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181B',
    textTransform: 'capitalize',
  },
  voltarHoje: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  botaoNovo: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  botaoNovoTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  vazioTexto: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
  },
});
