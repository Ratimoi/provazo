import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MediaPorMateria } from '../../domain/medias';

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
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 120,
    gap: 6,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nome: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    flexShrink: 1,
  },
  media: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
  },
});
