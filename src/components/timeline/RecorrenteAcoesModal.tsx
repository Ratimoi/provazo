import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Compromisso } from '../../domain/timeline';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

/** Ações de um compromisso recorrente tocado na Timeline. Aulas pertencem à
 * matéria, então só podem ser puladas (editar/excluir é pela aba de matérias). */
export function RecorrenteAcoesModal({
  visivel,
  compromisso,
  aoFechar,
  aoEditar,
  aoPular,
  aoExcluir,
  aoIrParaMaterias,
}: {
  visivel: boolean;
  compromisso: Compromisso | null;
  aoFechar: () => void;
  aoEditar: () => void;
  aoPular: () => void;
  aoExcluir: () => void;
  aoIrParaMaterias: () => void;
}) {
  if (!compromisso) return null;
  const ehAula = compromisso.tipo === 'aula';

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <View style={[styles.dot, { backgroundColor: compromisso.corHex }]} />
        <Text style={styles.titulo} numberOfLines={1}>
          {compromisso.titulo}
        </Text>
      </View>

      {ehAula ? (
        <Linha
          icone="school-outline"
          texto="Gerenciar aulas na matéria"
          onPress={aoIrParaMaterias}
        />
      ) : (
        <Linha icone="create-outline" texto="Editar compromisso" onPress={aoEditar} />
      )}
      <Linha
        icone="play-skip-forward-outline"
        texto="Pular só esta ocorrência"
        onPress={aoPular}
      />
      {!ehAula && (
        <Linha
          icone="trash-outline"
          texto="Excluir todas as ocorrências"
          destrutivo
          onPress={aoExcluir}
        />
      )}

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
    flex: 1,
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
