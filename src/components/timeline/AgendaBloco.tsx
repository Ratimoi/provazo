import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Compromisso } from '../../domain/timeline';
import { corDeTexto, font, radii, spacing } from '../../theme/tokens';

const ICONE_AVALIACAO: Record<'prova' | 'trabalho', keyof typeof Ionicons.glyphMap> = {
  prova: 'create-outline',
  trabalho: 'document-text-outline',
};

export function AgendaBloco({
  compromisso,
  top,
  altura,
  leftPct,
  larguraPct,
  onPress,
}: {
  compromisso: Compromisso;
  top: number;
  altura: number;
  leftPct: number;
  larguraPct: number;
  onPress: () => void;
}) {
  const compacto = altura < 40;
  const mostraObservacao = altura >= 60 && !!compromisso.observacoes;
  const corTexto = corDeTexto(compromisso.corHex);
  // Prova/trabalho é um prazo, não um intervalo de tempo — vira um marcador
  // compacto (pílula + ícone) em vez do bloco retangular usado por aulas e
  // compromissos com duração real.
  const icone =
    compromisso.tipo === 'prova' || compromisso.tipo === 'trabalho'
      ? ICONE_AVALIACAO[compromisso.tipo]
      : null;
  // Deixa explícito de qual instituição é a aula, pra diferenciar matérias
  // de faculdades diferentes cursadas ao mesmo tempo.
  const instituicaoInicial =
    compromisso.tipo === 'aula' && compromisso.instituicao
      ? compromisso.instituicao.trim().charAt(0).toUpperCase()
      : null;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.bloco,
        icone && styles.blocoMarcador,
        {
          top,
          height: altura,
          left: `${leftPct}%`,
          width: `${larguraPct}%`,
          backgroundColor: compromisso.corHex,
        },
      ]}
    >
      <View style={styles.linhaTitulo}>
        {icone && <Ionicons name={icone} size={11} color={corTexto} />}
        {instituicaoInicial && (
          <View style={[styles.badgeInstituicao, { borderColor: corTexto }]}>
            <Text style={[styles.badgeInstituicaoTexto, { color: corTexto }]}>
              {instituicaoInicial}
            </Text>
          </View>
        )}
        <Text
          style={[styles.titulo, { color: corTexto }]}
          numberOfLines={compacto ? 1 : 2}
        >
          {compromisso.titulo}
        </Text>
      </View>
      {!compacto && (
        <Text style={[styles.horario, { color: corTexto }]}>
          {compromisso.horaInicio}
          {compromisso.horaFim ? `–${compromisso.horaFim}` : ''}
        </Text>
      )}
      {mostraObservacao && (
        <Text
          style={[styles.observacao, { color: corTexto }]}
          numberOfLines={1}
        >
          {compromisso.observacoes}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bloco: {
    position: 'absolute',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  blocoMarcador: {
    borderRadius: radii.full,
    justifyContent: 'center',
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeInstituicao: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInstituicaoTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 8,
    lineHeight: 9,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
  },
  horario: {
    fontFamily: font.body,
    fontSize: 11,
    opacity: 0.85,
    fontVariant: ['tabular-nums'],
  },
  observacao: {
    fontFamily: font.body,
    fontSize: 10.5,
    opacity: 0.75,
    marginTop: 1,
  },
});
