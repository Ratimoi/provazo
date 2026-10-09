import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radii, spacing } from '../../theme/tokens';

export type OpcaoDuracao = { rotulo: string; minutos: number };

export const DURACOES_AULA: OpcaoDuracao[] = [
  { rotulo: '50 min', minutos: 50 },
  { rotulo: '1h', minutos: 60 },
  { rotulo: '1h40', minutos: 100 },
  { rotulo: '2h', minutos: 120 },
  { rotulo: '3h', minutos: 180 },
];

export const DURACOES_COMPROMISSO: OpcaoDuracao[] = [
  { rotulo: '30 min', minutos: 30 },
  { rotulo: '1h', minutos: 60 },
  { rotulo: '1h30', minutos: 90 },
  { rotulo: '2h', minutos: 120 },
];

/** Atalhos de duração: tocar numa opção calcula a hora de fim a partir do início. */
export function DuracaoChips({
  opcoes,
  minutosAtuais,
  aoEscolher,
}: {
  opcoes: OpcaoDuracao[];
  /** Duração atual (fim - início) em minutos, pra destacar a opção correspondente. */
  minutosAtuais: number | null;
  aoEscolher: (minutos: number) => void;
}) {
  return (
    <View style={styles.linha}>
      {opcoes.map((opcao) => {
        const ativo = opcao.minutos === minutosAtuais;
        return (
          <Pressable
            key={opcao.minutos}
            onPress={() => aoEscolher(opcao.minutos)}
            style={[styles.chip, ativo && styles.chipAtivo]}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm - 2,
  },
  chip: {
    minHeight: 34,
    paddingHorizontal: spacing.md - 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
  },
});
