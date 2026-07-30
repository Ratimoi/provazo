import { StyleSheet, Text, View } from 'react-native';

import { minutosDoDia, type Compromisso } from '../../domain/timeline';
import { TimelineBlock } from './TimelineBlock';

const MINUTOS_DIA = 24 * 60;
const DURACAO_PADRAO_MIN = 60;
const LARGURA_MINIMA_PCT = 2.5;

function calcularPosicao(compromisso: Compromisso) {
  const inicio = minutosDoDia(compromisso.horaInicio);
  const fim = compromisso.horaFim
    ? minutosDoDia(compromisso.horaFim)
    : inicio + DURACAO_PADRAO_MIN;
  const duracao = Math.max(fim - inicio, 15);

  return {
    leftPct: (inicio / MINUTOS_DIA) * 100,
    widthPct: Math.max((duracao / MINUTOS_DIA) * 100, LARGURA_MINIMA_PCT),
  };
}

export function TimelineStrip({
  compromissos,
  onPressCompromisso,
}: {
  compromissos: Compromisso[];
  onPressCompromisso: (compromisso: Compromisso) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.trilha}>
        {compromissos.map((compromisso) => {
          const { leftPct, widthPct } = calcularPosicao(compromisso);
          return (
            <TimelineBlock
              key={compromisso.id}
              compromisso={compromisso}
              leftPct={leftPct}
              widthPct={widthPct}
              onPress={() => onPressCompromisso(compromisso)}
            />
          );
        })}
      </View>
      <View style={styles.marcadores}>
        {['00h', '06h', '12h', '18h', '24h'].map((rotulo) => (
          <Text key={rotulo} style={styles.marcador}>
            {rotulo}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  trilha: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F0F0F3',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  marcadores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  marcador: {
    fontSize: 11,
    color: '#71717A',
    fontVariant: ['tabular-nums'],
  },
});
