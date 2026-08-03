import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AvaliacaoComMateria } from '../../domain/avaliacoes';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

const ROTULO_TIPO: Record<AvaliacaoComMateria['tipo'], string> = {
  prova: 'Prova',
  trabalho: 'Trabalho',
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function AvaliacaoCard({
  avaliacao,
  onPress,
}: {
  avaliacao: AvaliacaoComMateria;
  onPress: () => void;
}) {
  const corTipo = colors.tipo[avaliacao.tipo];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View
        style={[styles.faixa, { backgroundColor: avaliacao.materiaCorHex }]}
      />
      <View style={styles.corpo}>
        <View style={styles.linhaTopo}>
          <Text style={styles.materia}>{avaliacao.materiaNome}</Text>
          <View style={[styles.badge, { backgroundColor: `${corTipo}17` }]}>
            <Text style={[styles.badgeTexto, { color: corTipo }]}>
              {ROTULO_TIPO[avaliacao.tipo]}
            </Text>
          </View>
        </View>
        <View style={styles.linhaPrincipal}>
          <View style={styles.conteudo}>
            <Text style={styles.titulo} numberOfLines={1}>
              {avaliacao.titulo}
            </Text>
            <View style={styles.linhaInfo}>
              <Text style={styles.info}>
                {formatarData(avaliacao.data)} · {avaliacao.hora}
              </Text>
              <View style={styles.pontoSeparador} />
              <Text style={styles.info}>peso {avaliacao.peso}</Text>
            </View>
          </View>
          <View style={styles.notaContainer}>
            {avaliacao.nota != null ? (
              <Text style={styles.nota}>
                {avaliacao.nota}
                <Text style={styles.notaMaxima}>/{avaliacao.notaMaxima}</Text>
              </Text>
            ) : (
              <Text style={styles.notaPendente}>—</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
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
    padding: spacing.md,
    gap: spacing.xs,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  materia: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 11,
  },
  linhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  conteudo: {
    flex: 1,
    gap: 3,
  },
  titulo: {
    fontFamily: font.displayMedium,
    fontSize: 17,
    color: colors.ink,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  pontoSeparador: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.inkFaint,
  },
  notaContainer: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  nota: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  notaMaxima: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  notaPendente: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.line,
  },
});
