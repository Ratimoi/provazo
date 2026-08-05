import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CompromissoListItem } from '../../../src/components/timeline/CompromissoListItem';
import { TimelineStrip } from '../../../src/components/timeline/TimelineStrip';
import type { Compromisso } from '../../../src/domain/timeline';
import { getMateria } from '../../../src/domain/materias';
import { useCompromissosDoDia } from '../../../src/hooks/useCompromissosDoDia';
import { useDiaSelecionado } from '../../../src/hooks/useDiaSelecionado';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

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

      <TimelineStrip
        compromissos={compromissos}
        onPressCompromisso={abrirCompromisso}
      />

      {compromissos.length === 0 ? (
        <View style={styles.vazio}>
          <View style={styles.vazioIconContainer}>
            <Ionicons name="cafe-outline" size={26} color={colors.brand} />
          </View>
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
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
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
  lista: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: spacing.xs,
  },
  vazioIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
