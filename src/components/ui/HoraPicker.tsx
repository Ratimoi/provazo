import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { horaValida } from '../../domain/validacao';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from './BottomSheetModal';

const HORAS = Array.from({ length: 24 }, (_, h) => h);
const MINUTOS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const COLUNAS = 6;

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Folha pra escolher um horário tocando: grade de horas, grade de minutos e
 * atalhos com os horários que a pessoa já usa (sem digitar nada).
 */
export function HoraPicker({
  visivel,
  titulo,
  subtitulo,
  valor,
  sugestoes = [],
  permiteFimDoDia,
  aoFechar,
  aoConfirmar,
}: {
  visivel: boolean;
  titulo: string;
  subtitulo?: string;
  /** HH:MM atual; vazio se ainda não escolhido. */
  valor: string;
  sugestoes?: string[];
  /** Mostra o atalho 23:59 (prazos de entrega). */
  permiteFimDoDia?: boolean;
  aoFechar: () => void;
  aoConfirmar: (hora: string) => void;
}) {
  const { width } = useWindowDimensions();
  const gap = spacing.sm;
  const celula = (width - spacing.lg * 2 - gap * (COLUNAS - 1)) / COLUNAS;

  const [hora, setHora] = useState<number | null>(null);
  const [minuto, setMinuto] = useState<number | null>(null);

  useEffect(() => {
    if (!visivel) return;
    if (horaValida(valor)) {
      setHora(Number(valor.slice(0, 2)));
      setMinuto(Number(valor.slice(3, 5)));
    } else {
      setHora(null);
      setMinuto(null);
    }
  }, [visivel, valor]);

  function aplicarSugestao(texto: string) {
    setHora(Number(texto.slice(0, 2)));
    setMinuto(Number(texto.slice(3, 5)));
  }

  const completo = hora != null;
  const escolhido = completo ? `${doisDigitos(hora)}:${doisDigitos(minuto ?? 0)}` : '--:--';
  const atalhos = permiteFimDoDia && !sugestoes.includes('23:59')
    ? [...sugestoes, '23:59']
    : sugestoes;

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <View style={styles.cabecalho}>
        <View style={styles.titulos}>
          {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        <Text style={[styles.display, !completo && styles.displayVazio]}>
          {escolhido}
        </Text>
      </View>

      <Text style={styles.rotulo}>Horas</Text>
      <View style={[styles.grade, { gap }]}>
        {HORAS.map((h) => (
          <Pressable
            key={h}
            onPress={() => setHora(h)}
            style={[styles.celula, { width: celula }, hora === h && styles.celulaAtiva]}
          >
            <Text style={[styles.celulaTexto, hora === h && styles.celulaTextoAtivo]}>
              {doisDigitos(h)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.rotulo}>Minutos</Text>
      <View style={[styles.grade, { gap }]}>
        {MINUTOS.map((m) => {
          const ativo = (minuto ?? (completo ? 0 : -1)) === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMinuto(m)}
              style={[styles.celula, { width: celula }, ativo && styles.celulaAtiva]}
            >
              <Text style={[styles.celulaTexto, ativo && styles.celulaTextoAtivo]}>
                {doisDigitos(m)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {atalhos.length > 0 && (
        <>
          <Text style={styles.rotulo}>Horários que você já usa</Text>
          <View style={styles.atalhos}>
            {atalhos.map((sugestao) => (
              <Pressable
                key={sugestao}
                onPress={() => aplicarSugestao(sugestao)}
                style={styles.atalho}
              >
                <Text style={styles.atalhoTexto}>{sugestao}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Pressable
        style={[styles.botao, !completo && styles.botaoDesabilitado]}
        disabled={!completo}
        onPress={() => aoConfirmar(escolhido)}
      >
        <Text style={styles.botaoTexto}>
          {completo ? `Confirmar ${escolhido}` : 'Escolha a hora'}
        </Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  titulos: {
    flex: 1,
  },
  subtitulo: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
  },
  display: {
    fontFamily: font.display,
    fontSize: 40,
    color: colors.brand,
    fontVariant: ['tabular-nums'],
  },
  displayVazio: {
    color: colors.inkFaint,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celula: {
    height: 44,
    borderRadius: radii.sm + 2,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celulaAtiva: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  celulaTexto: {
    fontFamily: font.display,
    fontSize: 16,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  celulaTextoAtivo: {
    color: colors.surface,
  },
  atalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  atalho: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhoTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 13.5,
    color: colors.brand,
    fontVariant: ['tabular-nums'],
  },
  botao: {
    marginTop: spacing.lg,
    minHeight: 54,
    borderRadius: radii.md + 4,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: colors.inkFaint,
  },
  botaoTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 16,
    color: colors.surface,
  },
});
