import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

/** Controle segmentado (abas internas de uma tela): uma opção ativa por vez. */
export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  aoMudar,
  compacto,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  aoMudar: (valor: T) => void;
  /** Versão menor, pra alternâncias dentro de uma aba (Lista | Grade). */
  compacto?: boolean;
}) {
  return (
    <View style={[styles.trilho, compacto && styles.trilhoCompacto]}>
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoMudar(opcao.valor)}
            style={[
              styles.opcao,
              compacto && styles.opcaoCompacta,
              ativo && styles.opcaoAtiva,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
          >
            <Text
              style={[
                styles.texto,
                compacto && styles.textoCompacto,
                ativo && styles.textoAtivo,
              ]}
            >
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    backgroundColor: '#EFE9EC',
    borderRadius: radii.md + 2,
    padding: 4,
    gap: 4,
  },
  trilhoCompacto: {
    borderRadius: radii.md,
    padding: 3,
    gap: 3,
  },
  opcao: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md - 1,
  },
  opcaoCompacta: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm + 1,
  },
  opcaoAtiva: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  texto: {
    fontFamily: font.bodySemibold,
    fontSize: 13.5,
    color: colors.inkSoft,
  },
  textoCompacto: {
    fontSize: 12.5,
  },
  textoAtivo: {
    color: colors.brand,
  },
});
