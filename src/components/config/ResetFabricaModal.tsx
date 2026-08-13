import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';

const FRASE_CONFIRMACAO = 'APAGAR TUDO';

export function ResetFabricaModal({
  visivel,
  salvando,
  aoFechar,
  aoConfirmar,
}: {
  visivel: boolean;
  salvando?: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
}) {
  const [confirmacao, setConfirmacao] = useState('');

  useEffect(() => {
    if (visivel) setConfirmacao('');
  }, [visivel]);

  const habilitado = confirmacao.trim().toUpperCase() === FRASE_CONFIRMACAO;

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Restaurar padrão de fábrica</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Cancelar</Text>
        </Pressable>
      </View>

      <View style={styles.avisoCaixa}>
        <Text style={styles.aviso}>
          Isso apaga TODOS os dados do app — anos, semestres, matérias,
          avaliações, aulas fixas, compromissos e tarefas. Não dá pra
          desfazer.
        </Text>
      </View>

      <Text style={styles.rotulo}>
        Digite "{FRASE_CONFIRMACAO}" pra confirmar
      </Text>
      <TextInput
        style={styles.input}
        value={confirmacao}
        onChangeText={setConfirmacao}
        placeholder={FRASE_CONFIRMACAO}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.botaoApagar, !habilitado && styles.botaoDesabilitado]}
        onPress={aoConfirmar}
        disabled={!habilitado || salvando}
      >
        <Text style={styles.botaoApagarTexto}>
          {salvando ? 'Restaurando…' : 'Apagar tudo e restaurar'}
        </Text>
      </Pressable>
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
  avisoCaixa: {
    backgroundColor: `${colors.danger}12`,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  aviso: {
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.danger,
    lineHeight: 19,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  botaoApagar: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  botaoDesabilitado: {
    opacity: 0.4,
  },
  botaoApagarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
