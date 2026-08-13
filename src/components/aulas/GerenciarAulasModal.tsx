import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatarDiasSemana, type Aula } from '../../domain/eventosRecorrentes';
import type { Materia } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

export function GerenciarAulasModal({
  visivel,
  materia,
  aulas,
  aoFechar,
  aoEditarAula,
  aoExcluirAula,
  aoAdicionarAula,
}: {
  visivel: boolean;
  materia: Materia | null;
  aulas: Aula[];
  aoFechar: () => void;
  aoEditarAula: (aula: Aula) => void;
  aoExcluirAula: (aula: Aula) => void;
  aoAdicionarAula: () => void;
}) {
  if (!materia) return null;

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <View style={styles.tituloLinha}>
          <View style={[styles.dot, { backgroundColor: materia.corHex }]} />
          <Text style={styles.titulo}>Aulas de {materia.nome}</Text>
        </View>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Fechar</Text>
        </Pressable>
      </View>

      {aulas.length === 0 ? (
        <Text style={styles.vazio}>Nenhuma aula fixa cadastrada ainda.</Text>
      ) : (
        <View style={styles.lista}>
          {aulas.map((aula) => (
            <Pressable
              key={aula.id}
              style={({ pressed }) => [
                styles.linha,
                pressed && styles.linhaPressed,
              ]}
              onPress={() => aoEditarAula(aula)}
            >
              <View style={styles.linhaInfo}>
                <Text style={styles.linhaHorario}>
                  {formatarDiasSemana(aula.diasSemana)} · {aula.horaInicio}
                  {aula.horaFim ? `–${aula.horaFim}` : ''}
                </Text>
                {aula.observacoes && (
                  <Text style={styles.linhaObservacao} numberOfLines={1}>
                    {aula.observacoes}
                  </Text>
                )}
              </View>
              <Pressable hitSlop={10} onPress={() => aoExcluirAula(aula)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable style={styles.botaoAdicionar} onPress={aoAdicionarAula}>
        <Ionicons name="add" size={18} color={colors.brand} />
        <Text style={styles.botaoAdicionarTexto}>Adicionar aula</Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: font.display,
    fontSize: 18,
    color: colors.ink,
  },
  fechar: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  vazio: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkFaint,
    paddingVertical: spacing.md,
  },
  lista: {
    gap: spacing.xs,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  linhaPressed: {
    opacity: 0.7,
  },
  linhaInfo: {
    flex: 1,
    gap: 2,
  },
  linhaHorario: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  linhaObservacao: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  botaoAdicionarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.brand,
    fontSize: 15,
  },
});
