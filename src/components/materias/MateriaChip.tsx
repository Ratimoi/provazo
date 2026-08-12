import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Materia } from '../../domain/materias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

export function MateriaChip({
  materia,
  media,
  aulaResumo,
  ativo,
  onPress,
  onLongPress,
}: {
  materia: Materia;
  media: number | null;
  aulaResumo: string | null;
  ativo: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.chip,
        ativo && { backgroundColor: materia.corHex },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.linhaTopo}>
        <View
          style={[
            styles.dot,
            { backgroundColor: ativo ? colors.surface : materia.corHex },
          ]}
        />
        <Text
          style={[styles.nome, ativo && styles.textoAtivo]}
          numberOfLines={1}
        >
          {materia.nome}
        </Text>
        {media != null && (
          <Text style={[styles.media, ativo && styles.textoAtivo]}>
            {media.toFixed(1)}
          </Text>
        )}
      </View>
      {aulaResumo && (
        <View style={styles.linhaAula}>
          <Ionicons
            name="time-outline"
            size={11}
            color={ativo ? colors.surface : colors.inkFaint}
          />
          <Text style={[styles.aulaTexto, ativo && styles.textoAtivo]}>
            {aulaResumo}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 3,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.85,
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
    fontSize: 13,
    color: colors.ink,
    maxWidth: 140,
  },
  media: {
    fontFamily: font.display,
    fontSize: 13,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  linhaAula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aulaTexto: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
  textoAtivo: {
    color: colors.surface,
  },
});
