import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { memo, useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { datasDoPeriodo, somarDias } from '../../domain/periodo';
import type { Compromisso } from '../../domain/timeline';
import { colors, font, radii, spacing } from '../../theme/tokens';

const DIAS_NA_AGENDA = 14;

type Secao = { dia: string; titulo: string; subtitulo: string; data: Compromisso[] };

function rotuloDoDia(dia: string, hoje: string): { titulo: string; subtitulo: string } {
  const data = parseISO(dia);
  const curto = format(data, "EEE, d 'de' MMM", { locale: ptBR });
  if (dia === hoje) return { titulo: 'Hoje', subtitulo: curto };
  if (dia === somarDias(hoje, 1)) return { titulo: 'Amanhã', subtitulo: curto };
  return { titulo: format(data, 'EEEE', { locale: ptBR }), subtitulo: format(data, "d 'de' MMM", { locale: ptBR }) };
}

function AgendaListaBase({
  inicio,
  hoje,
  compromissosPorDia,
  aoPressionar,
}: {
  inicio: string;
  hoje: string;
  compromissosPorDia: Map<string, Compromisso[]>;
  aoPressionar: (compromisso: Compromisso) => void;
}) {
  const dias = useMemo(
    () => datasDoPeriodo(inicio, somarDias(inicio, DIAS_NA_AGENDA - 1)),
    [inicio],
  );

  const { secoes, diasLivres } = useMemo(() => {
    const comItens: Secao[] = [];
    const livres: string[] = [];
    for (const dia of dias) {
      const itens = compromissosPorDia.get(dia) ?? [];
      if (itens.length > 0) {
        comItens.push({ dia, ...rotuloDoDia(dia, hoje), data: itens });
      } else {
        livres.push(dia);
      }
    }
    return { secoes: comItens, diasLivres: livres };
  }, [dias, compromissosPorDia, hoje]);

  return (
    <SectionList
      sections={secoes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.conteudo}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.cabecalhoDia}>
          <Text style={[styles.tituloDia, section.dia === hoje && styles.tituloHoje]}>
            {section.titulo}
          </Text>
          <Text style={styles.subtituloDia}>{section.subtitulo}</Text>
        </View>
      )}
      renderItem={({ item }) => <LinhaAgenda compromisso={item} aoPressionar={aoPressionar} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListEmptyComponent={
        <Text style={styles.vazio}>Nada marcado pelos próximos {DIAS_NA_AGENDA} dias.</Text>
      }
      ListFooterComponent={
        diasLivres.length > 0 && secoes.length > 0 ? (
          <Text style={styles.livres}>
            {diasLivres.length} dia{diasLivres.length === 1 ? '' : 's'} sem nada marcado
          </Text>
        ) : null
      }
    />
  );
}

export const AgendaLista = memo(AgendaListaBase);

function LinhaAgenda({
  compromisso,
  aoPressionar,
}: {
  compromisso: Compromisso;
  aoPressionar: (compromisso: Compromisso) => void;
}) {
  const ehAvaliacao = compromisso.origem === 'avaliacao';
  const ehRotina = compromisso.origem === 'recorrente' && compromisso.tipo !== 'aula';
  const rotuloTipo =
    compromisso.tipo === 'aula'
      ? 'Aula'
      : compromisso.tipo === 'prova'
        ? 'Prova'
        : compromisso.tipo === 'trabalho'
          ? 'Trabalho'
          : null;

  return (
    <Pressable style={styles.linha} onPress={() => aoPressionar(compromisso)}>
      <View style={styles.horas}>
        <Text style={styles.horaInicio}>{compromisso.horaInicio}</Text>
        {compromisso.horaFim && <Text style={styles.horaFim}>{compromisso.horaFim}</Text>}
      </View>
      <View
        style={[
          styles.cartao,
          { backgroundColor: ehAvaliacao ? `${compromisso.corHex}40` : `${compromisso.corHex}2E` },
        ]}
      >
        <View style={styles.linhaTitulo}>
          {ehRotina && <Ionicons name="repeat" size={13} color={colors.ink} />}
          <Text style={styles.titulo} numberOfLines={1}>
            {compromisso.titulo}
          </Text>
          {rotuloTipo && (
            <View style={styles.tag}>
              <Text style={styles.tagTexto}>{rotuloTipo}</Text>
            </View>
          )}
        </View>
        {(compromisso.subtitulo || compromisso.instituicao) && (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {[compromisso.subtitulo, compromisso.instituicao].filter(Boolean).join(' · ')}
          </Text>
        )}
        {compromisso.observacoes ? (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {compromisso.observacoes}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },
  cabecalhoDia: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tituloDia: {
    fontFamily: font.display,
    fontSize: 16,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  tituloHoje: {
    color: colors.brand,
  },
  subtituloDia: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  linha: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  horas: {
    width: 46,
    alignItems: 'flex-end',
    paddingTop: spacing.sm + 2,
  },
  horaInicio: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  horaFim: {
    fontFamily: font.body,
    fontSize: 11.5,
    color: colors.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  cartao: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
    gap: 2,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: font.bodySemibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  tagTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 10.5,
    color: colors.ink,
  },
  subtitulo: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  vazio: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  livres: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
