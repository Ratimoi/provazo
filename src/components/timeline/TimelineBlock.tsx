import { Pressable, StyleSheet } from 'react-native';

import type { Compromisso } from '../../domain/timeline';

export function TimelineBlock({
  compromisso,
  leftPct,
  widthPct,
  onPress,
}: {
  compromisso: Compromisso;
  leftPct: number;
  widthPct: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.bloco,
        {
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          backgroundColor: compromisso.corHex,
        },
      ]}
      hitSlop={4}
    />
  );
}

const styles = StyleSheet.create({
  bloco: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 8,
    opacity: 0.92,
  },
});
