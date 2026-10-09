import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radii, spacing } from '../../theme/tokens';

/**
 * Campo que não recebe digitação: mostra o valor escolhido e abre um seletor
 * (hora, data…) ao toque. Substitui as máscaras de dígitos.
 */
export function CampoToque({
  rotulo,
  valor,
  placeholder,
  icone = 'time-outline',
  grande,
  aoPressionar,
}: {
  rotulo?: string;
  valor: string;
  placeholder: string;
  icone?: keyof typeof Ionicons.glyphMap;
  /** Valor em fonte de destaque (horários); sem isso fica em texto normal. */
  grande?: boolean;
  aoPressionar: () => void;
}) {
  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [styles.campo, pressed && styles.pressionado]}
    >
      <Ionicons name={icone} size={18} color={colors.brand} />
      <View style={styles.textos}>
        {rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}
        <Text
          style={[
            grande ? styles.valorGrande : styles.valor,
            !valor && styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {valor || placeholder}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  campo: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pressionado: {
    opacity: 0.7,
  },
  textos: {
    flex: 1,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 10.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  valor: {
    fontFamily: font.bodyMedium,
    fontSize: 15,
    color: colors.ink,
  },
  valorGrande: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  placeholder: {
    color: colors.inkSoft,
    fontFamily: font.body,
  },
});
