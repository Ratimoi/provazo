import { Pressable, StyleSheet, Text } from 'react-native';

import type { Compromisso } from '../../domain/timeline';
import { corDeTexto, font, radii, spacing } from '../../theme/tokens';

export function AgendaBloco({
  compromisso,
  top,
  altura,
  leftPct,
  larguraPct,
  onPress,
}: {
  compromisso: Compromisso;
  top: number;
  altura: number;
  leftPct: number;
  larguraPct: number;
  onPress: () => void;
}) {
  const compacto = altura < 40;
  const corTexto = corDeTexto(compromisso.corHex);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.bloco,
        {
          top,
          height: altura,
          left: `${leftPct}%`,
          width: `${larguraPct}%`,
          backgroundColor: compromisso.corHex,
        },
      ]}
    >
      <Text
        style={[styles.titulo, { color: corTexto }]}
        numberOfLines={compacto ? 1 : 2}
      >
        {compromisso.titulo}
      </Text>
      {!compacto && (
        <Text style={[styles.horario, { color: corTexto }]}>
          {compromisso.horaInicio}
          {compromisso.horaFim ? `–${compromisso.horaFim}` : ''}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bloco: {
    position: 'absolute',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  titulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
  },
  horario: {
    fontFamily: font.body,
    fontSize: 11,
    opacity: 0.85,
    fontVariant: ['tabular-nums'],
  },
});
