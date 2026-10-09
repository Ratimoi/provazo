import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Compromisso } from '../../domain/timeline';
import { colors, corDeTexto, font, radii, spacing } from '../../theme/tokens';

const ICONE_AVALIACAO: Record<'prova' | 'trabalho', keyof typeof Ionicons.glyphMap> = {
  prova: 'create-outline',
  trabalho: 'document-text-outline',
};

type Props = {
  compromisso: Compromisso;
  top: number;
  altura: number;
  leftPct: number;
  larguraPct: number;
  onPress: (compromisso: Compromisso) => void;
  onLongPress: (compromisso: Compromisso) => void;
};

/**
 * Bloco de um compromisso na grade do dia. Aulas e compromissos usam fundo
 * translúcido da cor; prova e trabalho são prazos, então viram uma pílula
 * sólida e compacta.
 */
function AgendaBlocoBase({
  compromisso,
  top,
  altura,
  leftPct,
  larguraPct,
  onPress,
  onLongPress,
}: Props) {
  const compacto = altura < 44;
  const mostraObservacao = altura >= 70 && !!compromisso.observacoes;
  const ehAvaliacao = compromisso.origem === 'avaliacao';
  const ehRotina = compromisso.origem === 'recorrente' && compromisso.tipo !== 'aula';
  const corTexto = ehAvaliacao ? corDeTexto(compromisso.corHex) : colors.ink;
  const instituicaoInicial =
    compromisso.tipo === 'aula' && compromisso.instituicao
      ? compromisso.instituicao.trim()
      : null;

  const icone =
    compromisso.tipo === 'prova' || compromisso.tipo === 'trabalho'
      ? ICONE_AVALIACAO[compromisso.tipo]
      : ehRotina
        ? 'repeat'
        : null;

  return (
    <Pressable
      onPress={() => onPress(compromisso)}
      onLongPress={() => onLongPress(compromisso)}
      delayLongPress={350}
      style={[
        styles.bloco,
        ehAvaliacao ? styles.blocoMarcador : styles.blocoTranslucido,
        {
          top,
          height: altura,
          left: `${leftPct}%`,
          width: `${larguraPct}%`,
          backgroundColor: ehAvaliacao ? compromisso.corHex : `${compromisso.corHex}33`,
        },
      ]}
    >
      <View style={styles.linhaTitulo}>
        {icone ? (
          <Ionicons name={icone} size={12} color={ehAvaliacao ? corTexto : compromisso.corHex} />
        ) : (
          <View style={[styles.ponto, { backgroundColor: compromisso.corHex }]} />
        )}
        <Text
          style={[styles.titulo, { color: corTexto }]}
          numberOfLines={compacto ? 1 : 2}
        >
          {compromisso.titulo}
        </Text>
        {instituicaoInicial && !compacto && (
          <View style={styles.pilula}>
            <Text style={styles.pilulaTexto} numberOfLines={1}>
              {instituicaoInicial}
            </Text>
          </View>
        )}
      </View>
      {!compacto && (
        <Text style={[styles.horario, { color: corTexto }]}>
          {compromisso.horaInicio}
          {compromisso.horaFim ? `–${compromisso.horaFim}` : ''}
        </Text>
      )}
      {mostraObservacao && (
        <Text style={[styles.observacao, { color: corTexto }]} numberOfLines={1}>
          {compromisso.observacoes}
        </Text>
      )}
    </Pressable>
  );
}

export const AgendaBloco = memo(AgendaBlocoBase);

const styles = StyleSheet.create({
  bloco: {
    position: 'absolute',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  blocoTranslucido: {
    borderRadius: radii.md,
  },
  blocoMarcador: {
    borderRadius: radii.full,
    justifyContent: 'center',
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pilula: {
    flexShrink: 0,
    maxWidth: 70,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  pilulaTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 10,
    color: colors.ink,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: font.bodySemibold,
    fontSize: 13,
  },
  horario: {
    fontFamily: font.body,
    fontSize: 11.5,
    opacity: 0.8,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  observacao: {
    fontFamily: font.body,
    fontSize: 11,
    opacity: 0.75,
    marginTop: 1,
  },
});
