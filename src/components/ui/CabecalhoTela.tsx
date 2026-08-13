import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing } from '../../theme/tokens';

/** Cabeçalho com seta de voltar pras telas empilhadas (fora de tab/modal),
 * já que o app não usa o header nativo do Stack em lugar nenhum. */
export function CabecalhoTela({ titulo }: { titulo: string }) {
  return (
    <View style={styles.cabecalho}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.voltar}>
        <Ionicons name="chevron-back" size={22} color={colors.brand} />
      </Pressable>
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  voltar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 18,
    color: colors.ink,
  },
});
