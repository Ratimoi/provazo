import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MediaPorMateria } from '../../domain/medias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

export function MediasResumo({ medias }: { medias: MediaPorMateria[] }) {
  if (medias.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {medias.map((item) => (
        <View key={item.materiaId} style={styles.card}>
          <View style={styles.linhaTopo}>
            <View style={[styles.dot, { backgroundColor: item.corHex }]} />
            <Text style={styles.nome} numberOfLines={1}>
              {item.materiaNome}
            </Text>
          </View>
          <Text style={styles.media}>
            {item.media != null ? item.media.toFixed(1) : '—'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 124,
    gap: spacing.xs,
    ...shadow.card,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nome: {
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.inkSoft,
    flexShrink: 1,
  },
  media: {
    fontFamily: font.display,
    fontSize: 24,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
});
