import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AvaliacaoComMateria } from '../../domain/avaliacoes';
import { rotuloPrazo } from '../../domain/prazos';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

const ROTULO_TIPO: Record<AvaliacaoComMateria['tipo'], string> = {
  prova: 'Prova',
  trabalho: 'Trabalho',
};

const DIA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function partesDaData(data: string) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return { dia, diaSemana: DIA_SEMANA[new Date(ano, mes - 1, dia).getDay()] };
}

export function AvaliacaoCard({
  avaliacao,
  hoje,
  onPress,
}: {
  avaliacao: AvaliacaoComMateria;
  /** AAAA-MM-DD de hoje, pra calcular o rótulo de prazo. */
  hoje: string;
  onPress: () => void;
}) {
  const corTipo = colors.tipo[avaliacao.tipo];
  const { dia, diaSemana } = partesDaData(avaliacao.data);
  const passou = avaliacao.data < hoje;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.data, { backgroundColor: `${avaliacao.materiaCorHex}26` }]}>
        <Text style={styles.dataDiaSemana}>{diaSemana}</Text>
        <Text style={styles.dataDia}>{dia}</Text>
      </View>

      <View style={styles.centro}>
        <Text style={styles.titulo} numberOfLines={1}>
          {avaliacao.titulo}
        </Text>
        <View style={styles.linhaInfo}>
          <View style={[styles.ponto, { backgroundColor: avaliacao.materiaCorHex }]} />
          <Text style={styles.info} numberOfLines={1}>
            {avaliacao.materiaNome}
            {avaliacao.materiaInstituicao ? ` · ${avaliacao.materiaInstituicao}` : ''}
          </Text>
        </View>
        <Text style={styles.info}>
          {avaliacao.hora} · peso {avaliacao.peso}
        </Text>
      </View>

      <View style={styles.direita}>
        <View style={[styles.badge, { backgroundColor: `${corTipo}1F` }]}>
          <Text style={[styles.badgeTexto, { color: corTipo }]}>
            {ROTULO_TIPO[avaliacao.tipo]}
          </Text>
        </View>
        {avaliacao.nota != null ? (
          <Text style={styles.nota}>
            {avaliacao.nota}
            <Text style={styles.notaMaxima}>/{avaliacao.notaMaxima}</Text>
          </Text>
        ) : (
          <Text style={[styles.prazo, passou && styles.prazoAtrasado]}>
            {passou ? 'sem nota' : rotuloPrazo(avaliacao.data, hoje)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  data: {
    width: 50,
    height: 54,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataDiaSemana: {
    fontFamily: font.bodySemibold,
    fontSize: 10.5,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dataDia: {
    fontFamily: font.display,
    fontSize: 20,
    lineHeight: 22,
    color: colors.ink,
  },
  centro: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontFamily: font.bodySemibold,
    fontSize: 15,
    color: colors.ink,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flexShrink: 1,
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  direita: {
    alignItems: 'flex-end',
    gap: spacing.xs + 2,
  },
  badge: {
    paddingHorizontal: spacing.sm + 1,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 11,
  },
  prazo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.brand,
  },
  prazoAtrasado: {
    color: colors.danger,
  },
  nota: {
    fontFamily: font.display,
    fontSize: 16,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  notaMaxima: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
});
