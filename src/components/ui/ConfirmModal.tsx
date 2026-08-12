import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

export function ConfirmModal({
  visivel,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  destrutivo,
  aoConfirmar,
  aoCancelar,
}: {
  visivel: boolean;
  titulo: string;
  mensagem?: string;
  textoConfirmar?: string;
  destrutivo?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  return (
    <Modal
      visible={visivel}
      animationType="fade"
      transparent
      onRequestClose={aoCancelar}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.cartao} edges={['bottom']}>
          <Text style={styles.titulo}>{titulo}</Text>
          {mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}
          <View style={styles.botoes}>
            <Pressable
              style={[styles.botao, styles.botaoCancelar]}
              onPress={aoCancelar}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[
                styles.botao,
                destrutivo ? styles.botaoDestrutivo : styles.botaoConfirmar,
              ]}
              onPress={aoConfirmar}
            >
              <Text style={styles.botaoConfirmarTexto}>{textoConfirmar}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,24,27,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cartao: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadow.floating,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 18,
    color: colors.ink,
  },
  mensagem: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  botoes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  botao: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: colors.surfaceSunken,
  },
  botaoCancelarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.inkSoft,
    fontSize: 15,
  },
  botaoConfirmar: {
    backgroundColor: colors.brand,
  },
  botaoDestrutivo: {
    backgroundColor: colors.danger,
  },
  botaoConfirmarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 15,
  },
});
