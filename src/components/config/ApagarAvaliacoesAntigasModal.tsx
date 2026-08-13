import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { contarAvaliacoesAntesDe } from '../../domain/sistema';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';
import { DataInput } from '../ui/DataInput';

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function ApagarAvaliacoesAntigasModal({
  visivel,
  salvando,
  aoFechar,
  aoConfirmar,
}: {
  visivel: boolean;
  salvando?: boolean;
  aoFechar: () => void;
  aoConfirmar: (dataCorte: string) => void;
}) {
  const [dataCorte, setDataCorte] = useState('');

  useEffect(() => {
    if (visivel) setDataCorte('');
  }, [visivel]);

  const dataValida = REGEX_DATA.test(dataCorte);
  const quantidade = useMemo(
    () => (dataValida ? contarAvaliacoesAntesDe(dataCorte) : null),
    [dataCorte, dataValida],
  );

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Apagar avaliações antigas</Text>
        <Pressable onPress={aoFechar} hitSlop={10}>
          <Text style={styles.fechar}>Cancelar</Text>
        </Pressable>
      </View>

      <Text style={styles.descricao}>
        Apaga provas e trabalhos com data anterior à escolhida, em todos os
        semestres. Não afeta matérias nem aulas fixas.
      </Text>

      <Text style={styles.rotulo}>Apagar tudo antes de</Text>
      <DataInput
        style={styles.input}
        value={dataCorte}
        onChangeText={setDataCorte}
      />

      {dataValida && quantidade != null && (
        <Text style={styles.contagem}>
          {quantidade === 0
            ? 'Nenhuma avaliação encontrada antes dessa data.'
            : `${quantidade} avaliaç${quantidade === 1 ? 'ão' : 'ões'} ser${
                quantidade === 1 ? 'á' : 'ão'
              } apagada${quantidade === 1 ? '' : 's'}.`}
        </Text>
      )}

      <Pressable
        style={[
          styles.botaoApagar,
          (!dataValida || quantidade === 0) && styles.botaoDesabilitado,
        ]}
        onPress={() => aoConfirmar(dataCorte)}
        disabled={!dataValida || quantidade === 0 || salvando}
      >
        <Text style={styles.botaoApagarTexto}>
          {salvando ? 'Apagando…' : 'Apagar avaliações'}
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
  descricao: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 19,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.md,
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
  contagem: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: spacing.sm,
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
