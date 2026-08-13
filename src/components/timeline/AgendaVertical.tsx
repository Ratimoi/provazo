import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ALTURA_TOTAL,
  atribuirColunas,
  intervaloDoCompromisso,
  minutosAgora,
  minutosParaPixels,
  PX_POR_HORA,
} from '../../domain/agenda';
import type { Compromisso } from '../../domain/timeline';
import { colors, font, spacing } from '../../theme/tokens';
import { AgendaBloco } from './AgendaBloco';

const GUTTER_LARGURA = 52;
const GAP_ENTRE_COLUNAS_PCT = 1.5;

function rotuloHora(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function AgendaVertical({
  compromissos,
  ehHoje,
  onPressCompromisso,
}: {
  compromissos: Compromisso[];
  ehHoje: boolean;
  onPressCompromisso: (compromisso: Compromisso) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [minutoAtual, setMinutoAtual] = useState(() => minutosAgora());

  useEffect(() => {
    if (!ehHoje) return;
    const intervalo = setInterval(() => setMinutoAtual(minutosAgora()), 60000);
    return () => clearInterval(intervalo);
  }, [ehHoje]);

  const posicoes = useMemo(() => {
    const intervalos = compromissos.map((c) => ({
      id: c.id,
      ...intervaloDoCompromisso(c),
    }));
    return atribuirColunas(intervalos);
  }, [compromissos]);

  useEffect(() => {
    const primeiroCompromisso = compromissos[0]
      ? intervaloDoCompromisso(compromissos[0]).inicioMin
      : 8 * 60;
    const alvoMin = ehHoje ? minutosAgora() : primeiroCompromisso;
    const y = Math.max(0, minutosParaPixels(alvoMin) - 140);
    scrollRef.current?.scrollTo({ y, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compromissos.length, ehHoje]);

  return (
    <View style={{ flex: 1 }}>
      {compromissos.length === 0 && (
        <Text style={styles.avisoVazio}>Nada marcado pra esse dia.</Text>
      )}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={styles.canvas}>
          <View style={styles.colunaHoras}>
            {Array.from({ length: 24 }, (_, h) => (
              <Text
                key={h}
                style={[
                  styles.rotuloHora,
                  { top: Math.max(0, h * PX_POR_HORA - 7) },
                ]}
              >
                {rotuloHora(h)}
              </Text>
            ))}
          </View>
          <View style={styles.corpo}>
            {Array.from({ length: 24 }, (_, h) => (
              <View
                key={h}
                style={[styles.linhaGrade, { top: h * PX_POR_HORA }]}
              />
            ))}
            {ehHoje && (
              <View
                style={[
                  styles.linhaAgora,
                  { top: minutosParaPixels(minutoAtual) },
                ]}
              />
            )}
            {compromissos.map((compromisso) => {
              const { inicioMin, fimMin } = intervaloDoCompromisso(compromisso);
              const pos = posicoes.get(compromisso.id) ?? {
                coluna: 0,
                totalColunas: 1,
              };
              const larguraPct =
                100 / pos.totalColunas -
                (pos.totalColunas > 1 ? GAP_ENTRE_COLUNAS_PCT : 0);
              const leftPct = (100 / pos.totalColunas) * pos.coluna;
              return (
                <AgendaBloco
                  key={compromisso.id}
                  compromisso={compromisso}
                  top={minutosParaPixels(inicioMin)}
                  altura={minutosParaPixels(fimMin - inicioMin)}
                  leftPct={leftPct}
                  larguraPct={larguraPct}
                  onPress={() => onPressCompromisso(compromisso)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avisoVazio: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  canvas: {
    flexDirection: 'row',
    height: ALTURA_TOTAL,
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  colunaHoras: {
    width: GUTTER_LARGURA,
  },
  rotuloHora: {
    position: 'absolute',
    fontFamily: font.bodyMedium,
    fontSize: 11,
    color: colors.inkFaint,
    fontVariant: ['tabular-nums'],
  },
  corpo: {
    flex: 1,
    position: 'relative',
  },
  linhaGrade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.line,
  },
  linhaAgora: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.danger,
    zIndex: 10,
  },
});
