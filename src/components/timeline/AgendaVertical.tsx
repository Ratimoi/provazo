import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  atribuirColunas,
  faixaDeHoras,
  intervaloDoCompromisso,
  lacunasLivres,
  minutosAgora,
  PX_POR_HORA,
  rotuloDuracao,
} from '../../domain/agenda';
import type { Compromisso } from '../../domain/timeline';
import { colors, font, spacing } from '../../theme/tokens';
import { AgendaBloco } from './AgendaBloco';

const GUTTER_LARGURA = 48;
const GAP_ENTRE_COLUNAS_PCT = 1.5;

function rotuloHora(h: number): string {
  return `${String(h % 24).padStart(2, '0')}:00`;
}

function paraPixels(minutos: number, inicioHora: number): number {
  return ((minutos - inicioHora * 60) / 60) * PX_POR_HORA;
}

/** Linha vermelha do horário atual, com o próprio relógio: só ela re-renderiza a cada minuto. */
function LinhaAgora({ inicioHora }: { inicioHora: number }) {
  const [minuto, setMinuto] = useState(() => minutosAgora());
  useEffect(() => {
    const intervalo = setInterval(() => setMinuto(minutosAgora()), 60000);
    return () => clearInterval(intervalo);
  }, []);
  const top = paraPixels(minuto, inicioHora);
  const hh = String(Math.floor(minuto / 60)).padStart(2, '0');
  const mm = String(minuto % 60).padStart(2, '0');
  return (
    <>
      <View style={[styles.linhaAgora, { top }]} />
      <View style={[styles.pilulaAgora, { top: top - 9 }]}>
        <Text style={styles.pilulaAgoraTexto}>
          {hh}:{mm}
        </Text>
      </View>
    </>
  );
}

function AgendaVerticalBase({
  compromissos,
  ehHoje,
  aoPressionar,
  aoSegurar,
}: {
  compromissos: Compromisso[];
  ehHoje: boolean;
  aoPressionar: (compromisso: Compromisso) => void;
  aoSegurar: (compromisso: Compromisso) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);

  const { inicioHora, fimHora } = useMemo(() => faixaDeHoras(compromissos), [compromissos]);
  const altura = (fimHora - inicioHora) * PX_POR_HORA;

  const posicoes = useMemo(
    () =>
      atribuirColunas(
        compromissos.map((c) => ({ id: c.id, ...intervaloDoCompromisso(c) })),
      ),
    [compromissos],
  );
  const lacunas = useMemo(() => lacunasLivres(compromissos), [compromissos]);

  // Rola até "agora" (hoje) ou até o primeiro compromisso — só ao montar a página,
  // pra não puxar a rolagem quando um dado novo chega.
  useEffect(() => {
    const alvoMin = ehHoje
      ? minutosAgora()
      : compromissos[0]
        ? intervaloDoCompromisso(compromissos[0]).inicioMin
        : 8 * 60;
    const y = Math.max(0, paraPixels(alvoMin, inicioHora) - 120);
    scrollRef.current?.scrollTo({ y, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.raiz}>
      {compromissos.length === 0 && (
        <Text style={styles.vazio}>Nada marcado pra esse dia.</Text>
      )}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={[styles.canvas, { height: altura + 24 }]}>
          <View style={styles.corpo}>
            {Array.from({ length: fimHora - inicioHora + 1 }, (_, i) => {
              const hora = inicioHora + i;
              return (
                <View key={hora} style={[styles.faixaHora, { top: i * PX_POR_HORA }]}>
                  <Text style={styles.rotuloHora}>{rotuloHora(hora)}</Text>
                  <View style={styles.linhaGrade} />
                </View>
              );
            })}

            <View style={styles.areaBlocos}>
              {lacunas.map((l) => (
                <Text
                  key={l.inicioMin}
                  style={[
                    styles.lacuna,
                    { top: paraPixels(l.inicioMin, inicioHora) + 6 },
                  ]}
                >
                  Livre por {rotuloDuracao(l.fimMin - l.inicioMin)}
                </Text>
              ))}

              {compromissos.map((compromisso) => {
                const { inicioMin, fimMin } = intervaloDoCompromisso(compromisso);
                const pos = posicoes.get(compromisso.id) ?? { coluna: 0, totalColunas: 1 };
                const larguraPct =
                  100 / pos.totalColunas -
                  (pos.totalColunas > 1 ? GAP_ENTRE_COLUNAS_PCT : 0);
                return (
                  <AgendaBloco
                    key={compromisso.id}
                    compromisso={compromisso}
                    top={paraPixels(inicioMin, inicioHora) + 1}
                    altura={((fimMin - inicioMin) / 60) * PX_POR_HORA - 2}
                    leftPct={(100 / pos.totalColunas) * pos.coluna}
                    larguraPct={larguraPct}
                    onPress={aoPressionar}
                    onLongPress={aoSegurar}
                  />
                );
              })}

              {ehHoje && <LinhaAgora inicioHora={inicioHora} />}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export const AgendaVertical = memo(AgendaVerticalBase);

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  vazio: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  canvas: {
    paddingHorizontal: spacing.lg,
  },
  corpo: {
    flex: 1,
    position: 'relative',
  },
  faixaHora: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotuloHora: {
    width: GUTTER_LARGURA,
    marginTop: -14,
    fontFamily: font.bodyMedium,
    fontSize: 11,
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  linhaGrade: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  areaBlocos: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: GUTTER_LARGURA + 4,
    right: 0,
  },
  lacuna: {
    position: 'absolute',
    left: 4,
    fontFamily: font.body,
    fontSize: 12,
    color: colors.inkSoft,
  },
  linhaAgora: {
    position: 'absolute',
    left: -6,
    right: 0,
    height: 2,
    backgroundColor: colors.danger,
    zIndex: 10,
  },
  pilulaAgora: {
    position: 'absolute',
    left: -GUTTER_LARGURA - 4,
    zIndex: 11,
    backgroundColor: colors.danger,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  pilulaAgoraTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 10.5,
    color: colors.surface,
    fontVariant: ['tabular-nums'],
  },
});
