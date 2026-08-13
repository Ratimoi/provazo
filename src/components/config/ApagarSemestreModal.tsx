import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SemestreComContagem } from '../../domain/sistema';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

export function ApagarSemestreModal({
  visivel,
  semestres,
  aoFechar,
  aoExcluir,
}: {
  visivel: boolean;
  semestres: SemestreComContagem[];
  aoFechar: () => void;
  aoExcluir: (semestre: SemestreComContagem) => void;
}) {
  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Apagar um semestre</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Fechar</Text>
        </Pressable>
      </View>

      <Text style={styles.descricao}>
        Apaga o semestre escolhido inteiro — matérias, avaliações e aulas
        fixas dele. Os outros semestres não são afetados.
      </Text>

      {semestres.length === 0 ? (
        <Text style={styles.vazio}>Nenhum semestre cadastrado ainda.</Text>
      ) : (
        <View style={styles.lista}>
          {semestres.map((s) => (
            <View key={s.id} style={styles.linha}>
              <Text style={styles.linhaTexto}>
                {s.anoValor} · {s.numero}º semestre
                <Text style={styles.linhaContagem}>
                  {'  '}
                  {s.materias} matéria{s.materias === 1 ? '' : 's'}
                </Text>
              </Text>
              <Pressable hitSlop={10} onPress={() => aoExcluir(s)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
  },
  fechar: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  descricao: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 19,
    marginBottom: spacing.md,
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
  linhaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.ink,
  },
  linhaContagem: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
});
