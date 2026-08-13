import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Materia } from '../../domain/materias';
import { colors, corDeTexto, font, radii, shadow, spacing } from '../../theme/tokens';

export function MateriaCard({
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
  const inicial = materia.nome.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        ativo && { borderColor: materia.corHex, backgroundColor: colors.brandSoft },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: materia.corHex }]}>
        <Text style={[styles.avatarTexto, { color: corDeTexto(materia.corHex) }]}>
          {inicial}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>
          {materia.nome}
        </Text>
        {aulaResumo ? (
          <View style={styles.linhaAula}>
            <Ionicons name="time-outline" size={11} color={colors.inkFaint} />
            <Text style={styles.aulaTexto} numberOfLines={1}>
              {aulaResumo}
            </Text>
          </View>
        ) : (
          media == null && <Text style={styles.semInfo}>Sem aula fixa</Text>
        )}
      </View>
      {media != null && (
        <View style={styles.mediaBadge}>
          <Text style={styles.mediaTexto}>{media.toFixed(1)}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: spacing.sm + 2,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarTexto: {
    fontFamily: font.display,
    fontSize: 15,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nome: {
    fontFamily: font.bodySemibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  linhaAula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aulaTexto: {
    fontFamily: font.body,
    fontSize: 10.5,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
  semInfo: {
    fontFamily: font.body,
    fontSize: 10.5,
    color: colors.inkFaint,
  },
  mediaBadge: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  mediaTexto: {
    fontFamily: font.display,
    fontSize: 12,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
});
