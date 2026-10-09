import { Ionicons } from '@expo/vector-icons';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { datasComEventos } from '../../domain/apoioSeletores';
import { dataValida } from '../../domain/validacao';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from './BottomSheetModal';

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function iso(data: Date): string {
  return format(data, 'yyyy-MM-dd');
}

/**
 * Folha com calendário do mês: toque num dia, ou use os atalhos
 * (Hoje, Amanhã…). Pontos marcam os dias que já têm prova, trabalho ou compromisso.
 */
export function DataPicker({
  visivel,
  titulo,
  valor,
  aoFechar,
  aoConfirmar,
}: {
  visivel: boolean;
  titulo: string;
  /** AAAA-MM-DD atual; vazio se ainda não escolhida. */
  valor: string;
  aoFechar: () => void;
  aoConfirmar: (data: string) => void;
}) {
  const { width } = useWindowDimensions();
  const celula = (width - spacing.lg * 2) / 7;

  const [mesVisivel, setMesVisivel] = useState(() => startOfMonth(new Date()));
  const [escolhida, setEscolhida] = useState<string>('');

  useEffect(() => {
    if (!visivel) return;
    const base = dataValida(valor) ? parseISO(valor) : new Date();
    setEscolhida(dataValida(valor) ? valor : '');
    setMesVisivel(startOfMonth(base));
  }, [visivel, valor]);

  const hoje = iso(new Date());
  const comEventos = useMemo(
    () =>
      visivel
        ? datasComEventos(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1)
        : new Set<string>(),
    [visivel, mesVisivel],
  );

  const dias = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(mesVisivel, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(mesVisivel), { weekStartsOn: 1 }),
      }),
    [mesVisivel],
  );

  function escolher(data: Date) {
    setEscolhida(iso(data));
    setMesVisivel(startOfMonth(data));
  }

  const atalhos: { rotulo: string; data: Date }[] = [
    { rotulo: 'Hoje', data: new Date() },
    { rotulo: 'Amanhã', data: addDays(new Date(), 1) },
    { rotulo: 'Próxima semana', data: addDays(new Date(), 7) },
    { rotulo: 'Fim do mês', data: endOfMonth(new Date()) },
  ];

  const legenda = escolhida
    ? format(parseISO(escolhida), "EEEE, d 'de' MMMM", { locale: ptBR })
    : '';

  return (
    <BottomSheetModal visivel={visivel} aoFechar={aoFechar}>
      <Text style={styles.titulo}>{titulo}</Text>

      <View style={styles.atalhos}>
        {atalhos.map(({ rotulo, data }) => (
          <Pressable
            key={rotulo}
            onPress={() => escolher(data)}
            style={[styles.atalho, escolhida === iso(data) && styles.atalhoAtivo]}
          >
            <Text
              style={[
                styles.atalhoTexto,
                escolhida === iso(data) && styles.atalhoTextoAtivo,
              ]}
            >
              {rotulo}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.mes}>
        <Pressable
          hitSlop={12}
          onPress={() => setMesVisivel((m) => addMonths(m, -1))}
          style={styles.seta}
        >
          <Ionicons name="chevron-back" size={20} color={colors.brand} />
        </Pressable>
        <Text style={styles.mesTexto}>
          {format(mesVisivel, 'MMMM yyyy', { locale: ptBR })}
        </Text>
        <Pressable
          hitSlop={12}
          onPress={() => setMesVisivel((m) => addMonths(m, 1))}
          style={styles.seta}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.brand} />
        </Pressable>
      </View>

      <View style={styles.linhaSemana}>
        {DIAS_SEMANA.map((d) => (
          <Text key={d} style={[styles.diaSemana, { width: celula }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.dias}>
        {dias.map((dia) => {
          const chave = iso(dia);
          const foraDoMes = dia.getMonth() !== mesVisivel.getMonth();
          const selecionado = chave === escolhida;
          const ehHoje = chave === hoje;
          return (
            <Pressable
              key={chave}
              onPress={() => escolher(dia)}
              style={[styles.dia, { width: celula }]}
            >
              <View
                style={[
                  styles.diaCirculo,
                  ehHoje && !selecionado && styles.diaHoje,
                  selecionado && styles.diaSelecionado,
                ]}
              >
                <Text
                  style={[
                    styles.diaTexto,
                    foraDoMes && styles.diaForaDoMes,
                    ehHoje && !selecionado && styles.diaTextoHoje,
                    selecionado && styles.diaTextoSelecionado,
                  ]}
                >
                  {dia.getDate()}
                </Text>
              </View>
              <View
                style={[
                  styles.ponto,
                  comEventos.has(chave) && !selecionado && styles.pontoVisivel,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legenda}>
        <View style={[styles.ponto, styles.pontoVisivel]} />
        <Text style={styles.legendaTexto}>
          Dias que já têm prova, trabalho ou compromisso
        </Text>
      </View>

      <Pressable
        style={[styles.botao, !escolhida && styles.botaoDesabilitado]}
        disabled={!escolhida}
        onPress={() => aoConfirmar(escolhida)}
      >
        <Text style={styles.botaoTexto}>
          {escolhida ? `Confirmar · ${legenda}` : 'Escolha um dia'}
        </Text>
      </Pressable>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  atalhos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  atalho: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atalhoAtivo: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brand,
  },
  atalhoTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  atalhoTextoAtivo: {
    color: colors.brand,
  },
  mes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  seta: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesTexto: {
    fontFamily: font.display,
    fontSize: 17,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  linhaSemana: {
    flexDirection: 'row',
  },
  diaSemana: {
    textAlign: 'center',
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.inkSoft,
    paddingBottom: spacing.xs,
  },
  dias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dia: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  diaCirculo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaHoje: {
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  diaSelecionado: {
    backgroundColor: colors.brand,
  },
  diaTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  diaForaDoMes: {
    color: colors.inkFaint,
  },
  diaTextoHoje: {
    color: colors.brand,
    fontFamily: font.bodySemibold,
  },
  diaTextoSelecionado: {
    color: colors.surface,
    fontFamily: font.bodySemibold,
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
  legenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  legendaTexto: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  botao: {
    marginTop: spacing.md,
    minHeight: 54,
    borderRadius: radii.md + 4,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  botaoDesabilitado: {
    backgroundColor: colors.inkFaint,
  },
  botaoTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 16,
    color: colors.surface,
    textTransform: 'none',
  },
});
