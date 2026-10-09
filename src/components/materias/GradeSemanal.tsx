import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Aula } from '../../domain/eventosRecorrentes';
import { horaDoToque, posicionarBlocosSemana } from '../../domain/grade';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';

const PX_POR_HORA = 40;
const LARGURA_ROTULOS = 32;
const ROTULO_DIA: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

/**
 * Visão semanal das aulas: colunas por dia, blocos coloridos por matéria.
 * Tocar num espaço vazio avisa o dia e a hora tocados, pra criar uma aula ali.
 */
export function GradeSemanal({
  aulas,
  aoPressionarAula,
  aoPressionarVazio,
}: {
  aulas: Aula[];
  aoPressionarAula: (aula: Aula) => void;
  aoPressionarVazio: (diaSemana: number, hora: string) => void;
}) {
  const grade = useMemo(
    () =>
      posicionarBlocosSemana(
        aulas.flatMap((aula) =>
          aula.horaFim
            ? aula.diasSemana.map((diaSemana) => ({
                diaSemana,
                horaInicio: aula.horaInicio,
                horaFim: aula.horaFim as string,
                dados: aula,
              }))
            : [],
        ),
        PX_POR_HORA,
      ),
    [aulas],
  );

  const horas = Array.from(
    { length: grade.fimHora - grade.inicioHora + 1 },
    (_, i) => grade.inicioHora + i,
  );

  return (
    <View style={styles.cartao}>
      <View style={styles.cabecalhoDias}>
        <View style={{ width: LARGURA_ROTULOS }} />
        {grade.dias.map((dia) => (
          <Text key={dia} style={styles.diaTitulo}>
            {ROTULO_DIA[dia]}
          </Text>
        ))}
      </View>

      <View style={[styles.corpo, { height: grade.alturaTotal }]}>
        {horas.map((hora) => (
          <View
            key={hora}
            style={[styles.linhaHora, { top: (hora - grade.inicioHora) * PX_POR_HORA }]}
          >
            <Text style={styles.rotuloHora}>{String(hora).padStart(2, '0')}</Text>
            <View style={styles.tracoHora} />
          </View>
        ))}

        <View style={styles.colunas}>
          {grade.dias.map((dia, coluna) => (
            <View key={dia} style={styles.coluna}>
              <Pressable
                style={StyleSheet.absoluteFill}
                accessibilityLabel={`Adicionar aula na ${ROTULO_DIA[dia]}`}
                onPress={(e) =>
                  aoPressionarVazio(
                    dia,
                    horaDoToque(e.nativeEvent.locationY, grade.inicioHora, PX_POR_HORA),
                  )
                }
              />
              {grade.blocos
                .filter((b) => b.coluna === coluna)
                .map((bloco) => (
                  <Pressable
                    key={`${bloco.dados.id}-${dia}`}
                    onPress={() => aoPressionarAula(bloco.dados)}
                    style={[
                      styles.bloco,
                      {
                        top: bloco.top,
                        height: bloco.altura,
                        left: `${(100 / bloco.totalSubColunas) * bloco.subColuna}%`,
                        width: `${100 / bloco.totalSubColunas}%`,
                        backgroundColor: `${bloco.dados.materiaCorHex}33`,
                      },
                    ]}
                  >
                    <Text style={styles.blocoNome} numberOfLines={2}>
                      {bloco.dados.materiaNome}
                    </Text>
                    <Text style={styles.blocoHora} numberOfLines={1}>
                      {bloco.dados.horaInicio}–{bloco.dados.horaFim}
                    </Text>
                  </Pressable>
                ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadow.card,
  },
  cabecalhoDias: {
    flexDirection: 'row',
    paddingBottom: spacing.xs + 2,
  },
  diaTitulo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  corpo: {
    position: 'relative',
  },
  linhaHora: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotuloHora: {
    width: LARGURA_ROTULOS - 4,
    textAlign: 'right',
    marginTop: -14,
    fontFamily: font.body,
    fontSize: 10,
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  tracoHora: {
    flex: 1,
    marginLeft: 4,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  colunas: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: LARGURA_ROTULOS,
    right: 0,
    flexDirection: 'row',
  },
  coluna: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: colors.lineSoft,
  },
  bloco: {
    position: 'absolute',
    marginHorizontal: 1,
    borderRadius: radii.sm + 1,
    padding: 4,
    overflow: 'hidden',
  },
  blocoNome: {
    fontFamily: font.bodySemibold,
    fontSize: 10.5,
    lineHeight: 12,
    color: colors.ink,
  },
  blocoHora: {
    fontFamily: font.body,
    fontSize: 9.5,
    color: colors.ink,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
});
