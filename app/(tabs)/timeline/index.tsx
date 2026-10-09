import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AgendaLista } from '../../../src/components/timeline/AgendaLista';
import { AgendaVertical } from '../../../src/components/timeline/AgendaVertical';
import { FaixaSemana } from '../../../src/components/timeline/FaixaSemana';
import { RecorrenteAcoesModal } from '../../../src/components/timeline/RecorrenteAcoesModal';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { DataPicker } from '../../../src/components/ui/DataPicker';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import {
  deleteEventoRecorrente,
  pularOcorrencia,
} from '../../../src/domain/eventosRecorrentes';
import { datasDoPeriodo, segundaDaSemana, somarDias } from '../../../src/domain/periodo';
import { rotuloPrazo } from '../../../src/domain/prazos';
import type { Compromisso } from '../../../src/domain/timeline';
import { useCompromissosDoPeriodo } from '../../../src/hooks/useCompromissosDoPeriodo';
import { useDiaSelecionado } from '../../../src/hooks/useDiaSelecionado';
import { useProximaAvaliacao } from '../../../src/hooks/useProximaAvaliacao';
import { colors, font, radii, shadow, spacing } from '../../../src/theme/tokens';

type Modo = 'dia' | 'agenda';

/** Dias carregados em volta do ponto de ancoragem; passado o limite, a lista recentraliza. */
const RAIO_DA_LISTA = 60;
const MARGEM_PARA_RECENTRALIZAR = 50;
const VAZIO: Compromisso[] = [];

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function TimelineScreen() {
  const { dataIso, hoje, ehHoje, irParaData, irParaHoje } = useDiaSelecionado();
  const { width } = useWindowDimensions();
  const [modo, setModo] = useState<Modo>('dia');
  const [ancora, setAncora] = useState(dataIso);
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [recorrenteSelecionado, setRecorrenteSelecionado] = useState<Compromisso | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const listaRef = useRef<FlatList<string>>(null);

  const dias = useMemo(
    () => datasDoPeriodo(somarDias(ancora, -RAIO_DA_LISTA), somarDias(ancora, RAIO_DA_LISTA)),
    [ancora],
  );

  // Semanas inteiras são lidas e guardadas; ±7 dias deixa a vizinha pronta antes do deslize.
  const porDia = useCompromissosDoPeriodo(
    modo === 'dia' ? somarDias(dataIso, -7) : dataIso,
    modo === 'dia' ? somarDias(dataIso, 7) : somarDias(dataIso, 14),
  );
  const { data: proximaAvaliacao } = useProximaAvaliacao();

  const diasComEventos = useMemo(() => {
    const segunda = segundaDaSemana(dataIso);
    return new Set(
      datasDoPeriodo(segunda, somarDias(segunda, 6)).filter(
        (d) => (porDia.get(d)?.length ?? 0) > 0,
      ),
    );
  }, [porDia, dataIso]);

  const abrirCompromisso = useCallback((compromisso: Compromisso) => {
    if (compromisso.origem === 'avaliacao') {
      if (compromisso.semestreId == null) return;
      router.push({
        pathname: '/provas-trabalhos/[id]',
        params: {
          id: String(compromisso.origemId),
          semestreId: String(compromisso.semestreId),
        },
      });
    } else if (compromisso.origem === 'evento_unico') {
      router.push({
        pathname: '/timeline/evento/[id]',
        params: { id: String(compromisso.origemId) },
      });
    } else {
      setRecorrenteSelecionado(compromisso);
    }
  }, []);

  function selecionar(iso: string) {
    const indice = dias.indexOf(iso);
    const indiceAtual = dias.indexOf(dataIso);
    irParaData(iso);
    if (indice === -1 || Math.abs(indice - RAIO_DA_LISTA) > MARGEM_PARA_RECENTRALIZAR) {
      setAncora(iso);
      return;
    }
    listaRef.current?.scrollToIndex({
      index: indice,
      animated: Math.abs(indice - indiceAtual) <= 7,
    });
  }

  function aoTerminarDeslize(posicaoX: number) {
    const indice = Math.round(posicaoX / width);
    const iso = dias[indice];
    if (!iso || iso === dataIso) return;
    irParaData(iso);
    if (Math.abs(indice - RAIO_DA_LISTA) > MARGEM_PARA_RECENTRALIZAR) setAncora(iso);
  }

  function editarRecorrente() {
    if (!recorrenteSelecionado) return;
    router.push({
      pathname: '/timeline/evento/recorrente/[id]',
      params: { id: String(recorrenteSelecionado.origemId) },
    });
    setRecorrenteSelecionado(null);
  }

  function pularRecorrente() {
    if (!recorrenteSelecionado) return;
    pularOcorrencia(recorrenteSelecionado.origemId, dataIso);
    setRecorrenteSelecionado(null);
  }

  function confirmarExclusaoRecorrente() {
    if (recorrenteSelecionado) deleteEventoRecorrente(recorrenteSelecionado.origemId);
    setConfirmarExclusao(false);
    setRecorrenteSelecionado(null);
  }

  const renderDia = useCallback(
    ({ item }: { item: string }) => (
      <View style={{ width, alignSelf: 'stretch' }}>
        <AgendaVertical
          compromissos={porDia.get(item) ?? VAZIO}
          ehHoje={item === hoje}
          aoPressionar={abrirCompromisso}
        />
      </View>
    ),
    [width, porDia, hoje, abrirCompromisso],
  );

  const diasAteProxima = proximaAvaliacao
    ? Math.round(
        (parseISO(proximaAvaliacao.data).getTime() - parseISO(hoje).getTime()) / 86400000,
      )
    : null;
  const mostraAviso =
    modo === 'dia' && proximaAvaliacao != null && diasAteProxima != null && diasAteProxima <= 3;

  const titulo =
    modo === 'dia'
      ? capitalizar(format(parseISO(dataIso), "EEEE, d 'de' MMMM", { locale: ptBR }))
      : 'Agenda';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoTextos}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          <View style={styles.subtituloLinha}>
            <Pressable onPress={() => setCalendarioAberto(true)} style={styles.calendarioLink}>
              <Ionicons name="calendar-outline" size={16} color={colors.brand} />
              <Text style={styles.subtitulo}>
                {modo === 'dia'
                  ? `${ehHoje ? 'Hoje · ' : ''}${format(parseISO(dataIso), 'MMMM yyyy', { locale: ptBR })}`
                  : 'Próximos 14 dias'}
              </Text>
            </Pressable>
            {!ehHoje && (
              <Pressable onPress={() => selecionar(hoje)} style={styles.voltarHoje}>
                <Text style={styles.voltarHojeTexto}>Hoje</Text>
              </Pressable>
            )}
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.botaoNovo, pressed && styles.botaoPressionado]}
          onPress={() =>
            router.push({ pathname: '/timeline/evento/novo', params: { data: dataIso } })
          }
          accessibilityLabel="Novo compromisso"
        >
          <Ionicons name="add" size={24} color={colors.surface} />
        </Pressable>
      </View>

      <View style={styles.abas}>
        <SegmentedControl
          compacto
          valor={modo}
          aoMudar={setModo}
          opcoes={[
            { valor: 'dia', rotulo: 'Dia' },
            { valor: 'agenda', rotulo: 'Agenda' },
          ]}
        />
      </View>

      {modo === 'dia' && (
        <FaixaSemana
          selecionado={dataIso}
          hoje={hoje}
          diasComEventos={diasComEventos}
          aoSelecionar={selecionar}
        />
      )}

      {mostraAviso && proximaAvaliacao && (
        <Pressable
          style={styles.aviso}
          onPress={() =>
            router.push({
              pathname: '/provas-trabalhos/[id]',
              params: {
                id: String(proximaAvaliacao.id),
                semestreId: String(proximaAvaliacao.materiaSemestreId),
              },
            })
          }
        >
          <Ionicons name="document-text-outline" size={16} color="#78350F" />
          <Text style={styles.avisoTexto} numberOfLines={1}>
            <Text style={styles.avisoDestaque}>
              {capitalizar(rotuloPrazo(proximaAvaliacao.data, hoje))}, {proximaAvaliacao.hora}
            </Text>
            {' · '}
            {proximaAvaliacao.titulo} de {proximaAvaliacao.materiaNome}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#78350F" />
        </Pressable>
      )}

      <View style={styles.conteudo}>
        {modo === 'dia' ? (
          <FlatList
            key={ancora}
            ref={listaRef}
            data={dias}
            keyExtractor={(d) => d}
            renderItem={renderDia}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.max(0, dias.indexOf(dataIso))}
            getItemLayout={(_, indice) => ({
              length: width,
              offset: width * indice,
              index: indice,
            })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            onMomentumScrollEnd={(e) => aoTerminarDeslize(e.nativeEvent.contentOffset.x)}
            onScrollToIndexFailed={({ index }) =>
              listaRef.current?.scrollToOffset({ offset: width * index, animated: false })
            }
          />
        ) : (
          <AgendaLista
            inicio={dataIso}
            hoje={hoje}
            compromissosPorDia={porDia}
            aoPressionar={abrirCompromisso}
          />
        )}
      </View>

      <DataPicker
        visivel={calendarioAberto}
        titulo="Ir para o dia"
        valor={dataIso}
        aoFechar={() => setCalendarioAberto(false)}
        aoConfirmar={(iso) => {
          setCalendarioAberto(false);
          selecionar(iso);
        }}
      />
      <RecorrenteAcoesModal
        visivel={recorrenteSelecionado !== null && !confirmarExclusao}
        compromisso={recorrenteSelecionado}
        aoFechar={() => setRecorrenteSelecionado(null)}
        aoEditar={editarRecorrente}
        aoPular={pularRecorrente}
        aoExcluir={() => setConfirmarExclusao(true)}
        aoIrParaMaterias={() => {
          setRecorrenteSelecionado(null);
          router.navigate('/provas-trabalhos');
        }}
      />
      <ConfirmModal
        visivel={confirmarExclusao}
        titulo="Excluir esse compromisso?"
        mensagem="Todas as ocorrências dele somem da timeline. Não dá pra desfazer."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={confirmarExclusaoRecorrente}
        aoCancelar={() => setConfirmarExclusao(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  cabecalhoTextos: {
    flex: 1,
  },
  titulo: {
    fontFamily: font.display,
    fontSize: 24,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  subtituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  calendarioLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    minHeight: 28,
  },
  subtitulo: {
    fontFamily: font.bodySemibold,
    fontSize: 13,
    color: colors.brand,
    textTransform: 'capitalize',
  },
  voltarHoje: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.brandSoft,
  },
  voltarHojeTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 12,
    color: colors.brand,
  },
  botaoNovo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  botaoPressionado: {
    opacity: 0.85,
  },
  abas: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radii.md,
    backgroundColor: '#FEF3C7',
  },
  avisoTexto: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 13,
    color: '#78350F',
  },
  avisoDestaque: {
    fontFamily: font.bodySemibold,
  },
  conteudo: {
    flex: 1,
    marginTop: spacing.sm,
  },
});
