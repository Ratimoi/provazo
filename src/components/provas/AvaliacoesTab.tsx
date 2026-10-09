import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AvaliacaoComMateria } from '../../domain/avaliacoes';
import { agruparPorPrazo, contagemDoPrazo, proximaAvaliacao } from '../../domain/prazos';
import { useAvaliacoesPorSemestre } from '../../hooks/useAvaliacoes';
import { useMateriasPorSemestre } from '../../hooks/useMaterias';
import { colors, font, radii, shadow, spacing } from '../../theme/tokens';
import { AvaliacaoCard } from '../avaliacoes/AvaliacaoCard';

/** Aba "Avaliações": destaque da próxima, filtro por matéria e lista por urgência. */
export function AvaliacoesTab({ semestreId }: { semestreId: number }) {
  const { data: avaliacoes = [] } = useAvaliacoesPorSemestre(semestreId);
  const { data: materias = [] } = useMateriasPorSemestre(semestreId);
  const [materiaFiltroId, setMateriaFiltroId] = useState<number | null>(null);
  const [anterioresAbertas, setAnterioresAbertas] = useState(false);

  const hoje = format(new Date(), 'yyyy-MM-dd');

  const grupos = useMemo(
    () =>
      agruparPorPrazo(
        materiaFiltroId
          ? avaliacoes.filter((a) => a.materiaId === materiaFiltroId)
          : avaliacoes,
        hoje,
      ),
    [avaliacoes, materiaFiltroId, hoje],
  );
  const proxima = proximaAvaliacao(grupos);
  const contagem = proxima ? contagemDoPrazo(proxima.data, hoje) : null;
  const total =
    grupos.estaSemana.length +
    grupos.proximas.length +
    grupos.aguardandoNota.length +
    grupos.anteriores.length;

  function abrir(avaliacao: AvaliacaoComMateria) {
    router.push({
      pathname: '/provas-trabalhos/[id]',
      params: { id: String(avaliacao.id), semestreId: String(semestreId) },
    });
  }

  function secao(titulo: string, itens: AvaliacaoComMateria[]) {
    if (itens.length === 0) return null;
    return (
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>
          {titulo} · {itens.length}
        </Text>
        {itens.map((a) => (
          <AvaliacaoCard key={a.id} avaliacao={a} hoje={hoje} onPress={() => abrir(a)} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.raiz}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        {proxima && contagem && (
          <Pressable style={styles.destaque} onPress={() => abrir(proxima)}>
            <View style={styles.destaqueContagem}>
              <Text style={styles.destaqueNumero}>{contagem.numero}</Text>
              <Text style={styles.destaqueUnidade}>{contagem.unidade}</Text>
            </View>
            <View style={styles.destaqueDivisor} />
            <View style={styles.destaqueTextos}>
              <Text style={styles.destaqueRotulo}>Próxima avaliação</Text>
              <Text style={styles.destaqueTitulo} numberOfLines={1}>
                {proxima.titulo} · {proxima.materiaNome}
              </Text>
              <Text style={styles.destaqueData} numberOfLines={1}>
                {format(parseISO(proxima.data), "EEE, d 'de' MMM", { locale: ptBR })} ·{' '}
                {proxima.hora}
                {proxima.materiaInstituicao ? ` · ${proxima.materiaInstituicao}` : ''}
              </Text>
            </View>
          </Pressable>
        )}

        {materias.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Pressable
              onPress={() => setMateriaFiltroId(null)}
              style={[styles.chip, materiaFiltroId === null && styles.chipAtivo]}
            >
              <Text
                style={[styles.chipTexto, materiaFiltroId === null && styles.chipTextoAtivo]}
              >
                Todas
              </Text>
            </Pressable>
            {materias.map((m) => {
              const ativo = materiaFiltroId === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMateriaFiltroId(ativo ? null : m.id)}
                  style={[styles.chip, ativo && styles.chipAtivo]}
                >
                  <View style={[styles.chipPonto, { backgroundColor: m.corHex }]} />
                  <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                    {m.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {total === 0 ? (
          <View style={styles.vazio}>
            <View style={styles.vazioIcone}>
              <Ionicons
                name={materias.length === 0 ? 'school-outline' : 'document-text-outline'}
                size={28}
                color={colors.brand}
              />
            </View>
            <Text style={styles.vazioTitulo}>
              {materias.length === 0
                ? 'Comece pelas matérias'
                : materiaFiltroId
                  ? 'Nada por aqui pra essa matéria'
                  : 'Nenhuma prova ou trabalho ainda'}
            </Text>
            <Text style={styles.vazioTexto}>
              {materias.length === 0
                ? 'Cadastre uma matéria na aba Matérias e depois volte pra adicionar as avaliações.'
                : materiaFiltroId
                  ? 'Toque em "Todas" pra ver as outras.'
                  : 'Que tal adicionar a primeira?'}
            </Text>
          </View>
        ) : (
          <>
            {secao('Esta semana', grupos.estaSemana)}
            {secao('Próximas', grupos.proximas)}
            {secao('Aguardando nota', grupos.aguardandoNota)}
            {grupos.anteriores.length > 0 && (
              <View style={styles.secao}>
                <Pressable
                  style={styles.anterioresCabecalho}
                  onPress={() => setAnterioresAbertas((v) => !v)}
                >
                  <Ionicons
                    name={anterioresAbertas ? 'chevron-down' : 'chevron-forward'}
                    size={16}
                    color={colors.inkSoft}
                  />
                  <Text style={styles.secaoTitulo}>
                    Anteriores · {grupos.anteriores.length}
                  </Text>
                </Pressable>
                {anterioresAbertas &&
                  grupos.anteriores.map((a) => (
                    <AvaliacaoCard
                      key={a.id}
                      avaliacao={a}
                      hoje={hoje}
                      onPress={() => abrir(a)}
                    />
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {materias.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressionado]}
          onPress={() =>
            router.push({
              pathname: '/provas-trabalhos/nova',
              params: { semestreId: String(semestreId) },
            })
          }
        >
          <Ionicons name="add" size={20} color={colors.surface} />
          <Text style={styles.fabTexto}>Avaliação</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  destaque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.floating,
  },
  destaqueContagem: {
    width: 64,
    alignItems: 'center',
  },
  destaqueNumero: {
    fontFamily: font.display,
    fontSize: 38,
    lineHeight: 40,
    color: colors.surface,
  },
  destaqueUnidade: {
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.brandSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  destaqueDivisor: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  destaqueTextos: {
    flex: 1,
    gap: 2,
  },
  destaqueRotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.brandSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  destaqueTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 17,
    color: colors.surface,
  },
  destaqueData: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.brandSoft,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipPonto: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  chipTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
  },
  secao: {
    gap: spacing.sm,
  },
  secaoTitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  anterioresCabecalho: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  vazioIcone: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  vazioTitulo: {
    fontFamily: font.displayMedium,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  vazioTexto: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl - 4,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    ...shadow.floating,
  },
  fabPressionado: {
    opacity: 0.85,
  },
  fabTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14.5,
    color: colors.surface,
  },
});
