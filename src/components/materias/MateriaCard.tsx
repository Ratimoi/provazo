import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Aula, formatarDiasSemana } from '../../domain/eventosRecorrentes';
import type { Materia } from '../../domain/materias';
import { colors, corDeTexto, font, radii, shadow, spacing } from '../../theme/tokens';

/** Cartão de matéria: avatar colorido, média e os horários de aula como chips. */
export function MateriaCard({
  materia,
  media,
  aulas,
  aoPressionar,
  aoAbrirMenu,
  aoAdicionarHorario,
}: {
  materia: Materia;
  media: number | null;
  aulas: Aula[];
  aoPressionar: () => void;
  aoAbrirMenu: () => void;
  aoAdicionarHorario: () => void;
}) {
  const inicial = materia.nome.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={aoPressionar}
      onLongPress={aoAbrirMenu}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado]}
    >
      <View style={styles.topo}>
        <View style={[styles.avatar, { backgroundColor: materia.corHex }]}>
          <Text style={[styles.avatarTexto, { color: corDeTexto(materia.corHex) }]}>
            {inicial}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>
            {materia.nome}
          </Text>
          <Text style={styles.detalhe} numberOfLines={1}>
            {aulas.length === 0
              ? 'Ainda sem horário de aula'
              : `${aulas.length} horário${aulas.length === 1 ? '' : 's'} por semana`}
          </Text>
        </View>
        <View style={styles.media}>
          <Text style={styles.mediaTexto}>{media != null ? media.toFixed(1) : '—'}</Text>
        </View>
        <Pressable
          onPress={aoAbrirMenu}
          hitSlop={10}
          accessibilityLabel={`Mais ações de ${materia.nome}`}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.inkSoft} />
        </Pressable>
      </View>

      <View style={styles.chips}>
        {aulas.map((aula) => {
          const sala = aula.observacoes ? ` · ${aula.observacoes}` : '';
          return (
            <View
              key={aula.id}
              style={[styles.chipAula, { backgroundColor: `${materia.corHex}26` }]}
            >
              <Text style={styles.chipAulaTexto} numberOfLines={1}>
                {formatarDiasSemana(aula.diasSemana)} {aula.horaInicio}
                {aula.horaFim ? `–${aula.horaFim}` : ''}
                {sala}
              </Text>
            </View>
          );
        })}
        <Pressable onPress={aoAdicionarHorario} style={styles.chipAdicionar} hitSlop={4}>
          <Ionicons name="add" size={15} color={colors.brand} />
          <Text style={styles.chipAdicionarTexto}>horário</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md - 2,
    ...shadow.card,
  },
  pressionado: {
    opacity: 0.85,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontFamily: font.display,
    fontSize: 17,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: font.bodySemibold,
    fontSize: 15.5,
    color: colors.ink,
  },
  detalhe: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  media: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  mediaTexto: {
    fontFamily: font.display,
    fontSize: 13,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chipAula: {
    minHeight: 34,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radii.sm + 2,
    justifyContent: 'center',
  },
  chipAulaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  chipAdicionar: {
    minHeight: 34,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radii.sm + 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C9A3B8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chipAdicionarTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.brand,
  },
});
