import { getDate, parseISO } from 'date-fns';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { datasDoPeriodo, segundaDaSemana, somarDias } from '../../domain/periodo';
import { colors, font, radii, spacing } from '../../theme/tokens';

const NOMES = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

/**
 * Os 7 dias da semana do dia selecionado, com um ponto nos dias que têm algo
 * marcado. Tocar num dia leva a ele.
 */
function FaixaSemanaBase({
  selecionado,
  hoje,
  diasComEventos,
  aoSelecionar,
}: {
  selecionado: string;
  hoje: string;
  diasComEventos: Set<string>;
  aoSelecionar: (dataIso: string) => void;
}) {
  const segunda = segundaDaSemana(selecionado);
  const dias = datasDoPeriodo(segunda, somarDias(segunda, 6));

  return (
    <View style={styles.faixa}>
      {dias.map((dia, i) => {
        const ativo = dia === selecionado;
        return (
          <Pressable
            key={dia}
            onPress={() => aoSelecionar(dia)}
            style={[styles.dia, ativo && styles.diaAtivo]}
            accessibilityLabel={dia}
          >
            <Text style={[styles.nome, ativo && styles.nomeAtivo]}>{NOMES[i]}</Text>
            <Text
              style={[
                styles.numero,
                dia === hoje && !ativo && styles.numeroHoje,
                ativo && styles.numeroAtivo,
              ]}
            >
              {getDate(parseISO(dia))}
            </Text>
            <View
              style={[
                styles.ponto,
                diasComEventos.has(dia) && styles.pontoVisivel,
                ativo && styles.pontoAtivo,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export const FaixaSemana = memo(FaixaSemanaBase);

const styles = StyleSheet.create({
  faixa: {
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: spacing.md,
  },
  dia: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: radii.lg - 2,
  },
  diaAtivo: {
    backgroundColor: colors.brand,
  },
  nome: {
    fontFamily: font.bodySemibold,
    fontSize: 11,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  nomeAtivo: {
    color: colors.brandSoft,
  },
  numero: {
    fontFamily: font.display,
    fontSize: 18,
    color: colors.ink,
  },
  numeroHoje: {
    color: colors.brand,
  },
  numeroAtivo: {
    color: colors.surface,
  },
  ponto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  pontoVisivel: {
    backgroundColor: colors.brand,
  },
  pontoAtivo: {
    backgroundColor: colors.surface,
  },
});
