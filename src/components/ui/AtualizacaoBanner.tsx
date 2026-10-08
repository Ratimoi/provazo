import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

/** Aviso flutuante "atualização pronta" — o app só reinicia quando a pessoa
 * toca, pra nunca perder o que estava sendo digitado. */
export function AtualizacaoBanner({ aoReiniciar }: { aoReiniciar: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={aoReiniciar}
      style={[styles.banner, { top: insets.top + spacing.sm }]}
    >
      <Text style={styles.texto}>Atualização pronta · toque para reiniciar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: radii.full,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    ...shadow.floating,
  },
  texto: {
    fontFamily: font.bodySemibold,
    fontSize: 13.5,
    color: colors.surface,
  },
});
