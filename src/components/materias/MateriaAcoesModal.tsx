import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Materia } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

export function MateriaAcoesModal({
  visivel,
  materia,
  aoFechar,
  aoEditar,
  aoGerenciarAulas,
  aoExcluir,
}: {
  visivel: boolean;
  materia: Materia | null;
  aoFechar: () => void;
  aoEditar: () => void;
  aoGerenciarAulas: () => void;
  aoExcluir: () => void;
}) {
  if (!materia) return null;

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <View style={[styles.dot, { backgroundColor: materia.corHex }]} />
        <Text style={styles.titulo}>{materia.nome}</Text>
      </View>

      <Linha icone="create-outline" texto="Editar matéria" onPress={aoEditar} />
      <Linha icone="time-outline" texto="Aulas" onPress={aoGerenciarAulas} />
      <Linha
        icone="trash-outline"
        texto="Excluir matéria"
        destrutivo
        onPress={aoExcluir}
      />

      <Pressable style={styles.cancelar} onPress={aoFechar}>
        <Text style={styles.cancelarTexto}>Cancelar</Text>
      </Pressable>
    </BottomSheetModal>
  );
}

function Linha({
  icone,
  texto,
  destrutivo,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  texto: string;
  destrutivo?: boolean;
  onPress: () => void;
}) {
  const cor = destrutivo ? colors.danger : colors.ink;
  return (
    <Pressable
      style={({ pressed }) => [styles.linha, pressed && styles.linhaPressed]}
      onPress={onPress}
    >
      <Ionicons name={icone} size={20} color={cor} />
      <Text style={[styles.linhaTexto, { color: cor }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 18,
    color: colors.ink,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  linhaPressed: {
    opacity: 0.6,
  },
  linhaTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 16,
  },
  cancelar: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
  },
  cancelarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.inkSoft,
    fontSize: 15,
  },
});
