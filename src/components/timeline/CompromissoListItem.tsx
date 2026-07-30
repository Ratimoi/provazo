import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Compromisso } from '../../domain/timeline';

const ROTULO_TIPO: Record<Compromisso['tipo'], string> = {
  aula: 'Aula',
  prova: 'Prova',
  trabalho: 'Trabalho',
  pessoal: 'Pessoal',
};

export function CompromissoListItem({
  compromisso,
  onPress,
}: {
  compromisso: Compromisso;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: compromisso.corHex }]} />
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>{compromisso.titulo}</Text>
        <Text style={styles.info}>
          {ROTULO_TIPO[compromisso.tipo]}
          {compromisso.subtitulo ? ` · ${compromisso.subtitulo}` : ''}
        </Text>
      </View>
      <Text style={styles.horario}>
        {compromisso.horaInicio}
        {compromisso.horaFim ? `–${compromisso.horaFim}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
  },
  info: {
    fontSize: 13,
    color: '#71717A',
  },
  horario: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18181B',
    fontVariant: ['tabular-nums'],
  },
});
