import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AvaliacaoComMateria } from '../../domain/avaliacoes';
import { CORES_TIPO } from '../../domain/cores';

const ROTULO_TIPO: Record<AvaliacaoComMateria['tipo'], string> = {
  prova: 'Prova',
  trabalho: 'Trabalho',
};

const COR_TIPO: Record<AvaliacaoComMateria['tipo'], string> = {
  prova: CORES_TIPO.prova,
  trabalho: CORES_TIPO.trabalho,
};

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function AvaliacaoCard({
  avaliacao,
  onPress,
}: {
  avaliacao: AvaliacaoComMateria;
  onPress: () => void;
}) {
  const corTipo = COR_TIPO[avaliacao.tipo];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: avaliacao.materiaCorHex }]} />
      <View style={styles.conteudo}>
        <View style={styles.linhaTopo}>
          <Text style={styles.materia}>{avaliacao.materiaNome}</Text>
          <View style={[styles.badge, { backgroundColor: `${corTipo}1A` }]}>
            <Text style={[styles.badgeTexto, { color: corTipo }]}>
              {ROTULO_TIPO[avaliacao.tipo]}
            </Text>
          </View>
        </View>
        <Text style={styles.titulo}>{avaliacao.titulo}</Text>
        <View style={styles.linhaInfo}>
          <Text style={styles.info}>
            {formatarData(avaliacao.data)} · {avaliacao.hora}
          </Text>
          <Text style={styles.info}>peso {avaliacao.peso}</Text>
        </View>
      </View>
      <View style={styles.notaContainer}>
        {avaliacao.nota != null ? (
          <Text style={styles.nota}>
            {avaliacao.nota}
            <Text style={styles.notaMaxima}>/{avaliacao.notaMaxima}</Text>
          </Text>
        ) : (
          <Text style={styles.notaPendente}>—</Text>
        )}
      </View>
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
    gap: 4,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  materia: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  linhaInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    fontSize: 13,
    color: '#71717A',
  },
  notaContainer: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  nota: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181B',
  },
  notaMaxima: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
  },
  notaPendente: {
    fontSize: 18,
    color: '#E4E4E7',
  },
});
