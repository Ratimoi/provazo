import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Compromisso } from '../../domain/timeline';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

const ROTULO_TIPO: Record<Compromisso['tipo'], string> = {
  aula: 'Aula',
  prova: 'Prova',
  trabalho: 'Trabalho',
  pessoal: 'Pessoal',
};

export function CompromissoListItem({
  compromisso,
  onPress,
}: {
  compromisso: Compromisso;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.faixa, { backgroundColor: compromisso.corHex }]} />
      <View style={styles.corpo}>
        <Text style={styles.titulo}>{compromisso.titulo}</Text>
        <Text style={styles.info}>
          {ROTULO_TIPO[compromisso.tipo]}
          {compromisso.subtitulo ? ` · ${compromisso.subtitulo}` : ''}
        </Text>
      </View>
      <Text style={styles.horario}>
        {compromisso.horaInicio}
        {compromisso.horaFim ? `–${compromisso.horaFim}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  faixa: {
    width: 4,
  },
  corpo: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  titulo: {
    fontFamily: font.displayMedium,
    fontSize: 16,
    color: colors.ink,
  },
  info: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  horario: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    alignSelf: 'center',
    paddingRight: spacing.md,
  },
});
