import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AvaliacaoCard } from '../../../src/components/avaliacoes/AvaliacaoCard';
import { MediasResumo } from '../../../src/components/avaliacoes/MediasResumo';
import type { AvaliacaoComMateria } from '../../../src/domain/avaliacoes';
import { useAvaliacoesPorSemestre } from '../../../src/hooks/useAvaliacoes';
import { useMateriasPorSemestre } from '../../../src/hooks/useMaterias';
import { useMediasPorMateria } from '../../../src/hooks/useMediasPorMateria';
import { useSemestreSelecionado } from '../../../src/hooks/useSemestreSelecionado';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

function agruparPorMateria(avaliacoes: AvaliacaoComMateria[]) {
  const grupos = new Map<string, AvaliacaoComMateria[]>();
  for (const av of avaliacoes) {
    const lista = grupos.get(av.materiaNome) ?? [];
    lista.push(av);
    grupos.set(av.materiaNome, lista);
  }
  return Array.from(grupos.entries()).map(([titulo, data]) => ({
    title: titulo,
    data,
  }));
}

export default function ProvasTrabalhosScreen() {
  const { selecionado, semestre, irParaAnterior, irParaProximo } =
    useSemestreSelecionado();

  const { data: materias = [] } = useMateriasPorSemestre(semestre.id);
  const { data: avaliacoes = [] } = useAvaliacoesPorSemestre(semestre.id);
  const { data: medias = [] } = useMediasPorMateria(semestre.id);

  const secoes = useMemo(() => agruparPorMateria(avaliacoes), [avaliacoes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tituloPagina}>Provas e Trabalhos</Text>
          <View style={styles.seletor}>
            <Pressable onPress={irParaAnterior} hitSlop={10}>
              <Ionicons name="chevron-back" size={18} color={colors.brand} />
            </Pressable>
            <Text style={styles.periodo}>
              {selecionado.anoValor} · {selecionado.numero}º semestre
            </Text>
            <Pressable onPress={irParaProximo} hitSlop={10}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.brand}
              />
            </Pressable>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.botaoNovo,
            pressed && styles.botaoPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: '/provas-trabalhos/nova',
              params: { semestreId: String(semestre.id) },
            })
          }
        >
          <Ionicons name="add" size={18} color={colors.surface} />
          <Text style={styles.botaoNovoTexto}>Avaliação</Text>
        </Pressable>
      </View>

      <MediasResumo medias={medias} />

      {materias.length === 0 ? (
        <View style={styles.vazio}>
          <View style={styles.vazioIconContainer}>
            <Ionicons name="school-outline" size={28} color={colors.brand} />
          </View>
          <Text style={styles.vazioTitulo}>Nenhuma matéria ainda</Text>
          <Text style={styles.vazioTexto}>
            Crie a primeira matéria deste semestre pra começar a lançar provas
            e trabalhos.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.botaoVazio,
              pressed && styles.botaoPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: '/provas-trabalhos/nova-materia',
                params: { semestreId: String(semestre.id) },
              })
            }
          >
            <Text style={styles.botaoVazioTexto}>Criar matéria</Text>
          </Pressable>
        </View>
      ) : avaliacoes.length === 0 ? (
        <View style={styles.vazio}>
          <View style={styles.vazioIconContainer}>
            <Ionicons
              name="document-text-outline"
              size={28}
              color={colors.brand}
            />
          </View>
          <Text style={styles.vazioTitulo}>
            Nenhuma prova ou trabalho por aqui ainda
          </Text>
          <Text style={styles.vazioTexto}>Que tal adicionar o primeiro?</Text>
        </View>
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          renderSectionHeader={({ section }) => (
            <Text style={styles.secaoTitulo}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <AvaliacaoCard
              avaliacao={item}
              onPress={() =>
                router.push({
                  pathname: '/provas-trabalhos/[id]',
                  params: {
                    id: String(item.id),
                    semestreId: String(semestre.id),
                  },
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          SectionSeparatorComponent={() => (
            <View style={{ height: spacing.lg }} />
          )}
        />
      )}
    </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  tituloPagina: {
    fontFamily: font.display,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  seletor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodo: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  botaoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    ...shadow.floating,
  },
  botaoPressed: {
    opacity: 0.85,
  },
  botaoNovoTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 14,
  },
  lista: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
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
  vazioTitulo: {
    fontFamily: font.displayMedium,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  botaoVazio: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
    ...shadow.floating,
  },
  botaoVazioTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 15,
  },
});
