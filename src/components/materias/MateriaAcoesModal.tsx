import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Materia } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';

export function MateriaAcoesModal({
  visivel,
  materia,
  temAula,
  aoFechar,
  aoEditar,
  aoAdicionarAula,
  aoRemoverAula,
  aoExcluir,
}: {
  visivel: boolean;
  materia: Materia | null;
  temAula: boolean;
  aoFechar: () => void;
  aoEditar: () => void;
  aoAdicionarAula: () => void;
  aoRemoverAula: () => void;
  aoExcluir: () => void;
}) {
  if (!materia) return null;

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent
      onRequestClose={aoFechar}
    >
      <Pressable style={styles.overlay} onPress={aoFechar}>
        <SafeAreaView style={styles.folha} edges={['bottom']} onStartShouldSetResponder={() => true}>
          <View style={styles.cabecalho}>
            <View
              style={[styles.dot, { backgroundColor: materia.corHex }]}
            />
            <Text style={styles.titulo}>{materia.nome}</Text>
          </View>

          <Linha
            icone="create-outline"
            texto="Editar matéria"
            onPress={aoEditar}
          />
          {temAula ? (
            <Linha
              icone="close-circle-outline"
              texto="Remover aula fixa"
              destrutivo
              onPress={aoRemoverAula}
            />
          ) : (
            <Linha
              icone="time-outline"
              texto="Adicionar aula"
              onPress={aoAdicionarAula}
            />
          )}
          <Linha
            icone="trash-outline"
            texto="Excluir matéria"
            destrutivo
            onPress={aoExcluir}
          />

          <Pressable style={styles.cancelar} onPress={aoFechar}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,24,27,0.4)',
    justifyContent: 'flex-end',
  },
  folha: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
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
