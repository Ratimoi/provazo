import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CORES_TIPO } from '../../domain/cores';
import type { NovoEventoUnico } from '../../domain/eventosUnicos';
import type { FrequenciaRecorrencia } from '../../domain/eventosRecorrentes';
import { listHorariosUsados } from '../../domain/apoioSeletores';
import { duracaoEmMinutos, somarMinutos } from '../../domain/horarios';
import {
  dataValida,
  horaFimDepoisDeInicio,
  horaValida,
} from '../../domain/validacao';
import { PALETA_MATERIAS } from '../../domain/materias';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { CampoToque } from '../ui/CampoToque';
import { DataPicker } from '../ui/DataPicker';
import { DURACOES_COMPROMISSO, DuracaoChips } from '../ui/DuracaoChips';
import { HoraPicker } from '../ui/HoraPicker';


const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatarDataCampo(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

export type Repeticao = 'nunca' | FrequenciaRecorrencia;

const OPCOES_REPETICAO: { valor: Repeticao; rotulo: string }[] = [
  { valor: 'nunca', rotulo: 'Nunca' },
  { valor: 'semanal', rotulo: 'Toda semana' },
  { valor: 'mensal', rotulo: 'Todo mês' },
  { valor: 'anual', rotulo: 'Todo ano' },
];

const DIAS = [
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
  { valor: 0, rotulo: 'Dom' },
];

export type ValorFormularioEvento = {
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  corHex: string;
  observacoes: string;
};

export function EventoUnicoForm({
  dataInicial,
  valorInicial,
  rotuloBotao = 'Salvar',
  permiteRepetir = false,
  repeticaoInicial = 'nunca',
  diasSemanaIniciais = [],
  aoSalvar,
}: {
  dataInicial: string;
  valorInicial?: Partial<ValorFormularioEvento>;
  rotuloBotao?: string;
  /** Mostra o seletor "Repetir" — só faz sentido ao criar um compromisso novo. */
  permiteRepetir?: boolean;
  repeticaoInicial?: Repeticao;
  diasSemanaIniciais?: number[];
  aoSalvar: (
    dados: NovoEventoUnico,
    repeticao: Repeticao,
    diasSemana: number[],
  ) => void;
}) {
  const [valor, setValor] = useState<ValorFormularioEvento>({
    titulo: '',
    data: dataInicial,
    horaInicio: '',
    horaFim: '',
    corHex: CORES_TIPO.pessoal,
    observacoes: '',
    ...valorInicial,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [repeticao, setRepeticao] = useState<Repeticao>(repeticaoInicial);
  const [diasSemana, setDiasSemana] = useState<number[]>(diasSemanaIniciais);
  const [seletor, setSeletor] = useState<'data' | 'inicio' | 'fim' | null>(null);
  const [sugestoes, setSugestoes] = useState<string[]>([]);

  function abrirSeletorHora(qual: 'inicio' | 'fim') {
    setSugestoes(listHorariosUsados());
    setSeletor(qual);
  }

  function atualizar<K extends keyof ValorFormularioEvento>(
    campo: K,
    novoValor: ValorFormularioEvento[K],
  ) {
    setValor((atual) => ({ ...atual, [campo]: novoValor }));
  }

  // Um compromisso que já é recorrente não volta a ser avulso por aqui.
  const opcoesRepeticao =
    repeticaoInicial === 'nunca'
      ? OPCOES_REPETICAO
      : OPCOES_REPETICAO.filter((o) => o.valor !== 'nunca');

  function alternarDia(dia: number) {
    setDiasSemana((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia],
    );
  }

  function handleSalvar() {
    if (valor.titulo.trim().length === 0) {
      setErro('Dê um título pra esse compromisso.');
      return;
    }
    if (repeticao === 'semanal') {
      if (diasSemana.length === 0) {
        setErro('Escolha pelo menos um dia da semana.');
        return;
      }
    } else if (!dataValida(valor.data)) {
      setErro('Escolha a data do compromisso.');
      return;
    }
    if (!horaValida(valor.horaInicio)) {
      setErro('Escolha a hora de início.');
      return;
    }
    if (valor.horaFim && !horaValida(valor.horaFim)) {
      setErro('Escolha a hora de fim.');
      return;
    }
    if (valor.horaFim && !horaFimDepoisDeInicio(valor.horaInicio, valor.horaFim)) {
      setErro('A hora de fim precisa ser depois da hora de início.');
      return;
    }
    setErro(null);
    aoSalvar(
      {
        titulo: valor.titulo.trim(),
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim || null,
        corHex: valor.corHex,
        observacoes: valor.observacoes.trim() || null,
      },
      repeticao,
      diasSemana,
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.rotulo}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Novo compromisso"
        value={valor.titulo}
        onChangeText={(v) => atualizar('titulo', v)}
        autoFocus
      />

      {permiteRepetir && (
        <>
          <Text style={styles.rotulo}>Repetir</Text>
          <View style={styles.chips}>
            {opcoesRepeticao.map((opcao) => {
              const selecionada = opcao.valor === repeticao;
              return (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setRepeticao(opcao.valor)}
                  style={[styles.chip, selecionada && styles.chipAtivoNeutro]}
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      selecionada && styles.chipTextoAtivo,
                    ]}
                  >
                    {opcao.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {repeticao === 'semanal' ? (
        <>
          <Text style={styles.rotulo}>Dias da semana</Text>
          <View style={styles.chips}>
            {DIAS.map((d) => {
              const selecionado = diasSemana.includes(d.valor);
              return (
                <Pressable
                  key={d.valor}
                  onPress={() => alternarDia(d.valor)}
                  style={[styles.chip, selecionado && styles.chipAtivoNeutro]}
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      selecionado && styles.chipTextoAtivo,
                    ]}
                  >
                    {d.rotulo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.rotulo}>Data</Text>
          <View style={styles.linha}>
            <CampoToque
              valor={dataValida(valor.data) ? formatarDataCampo(valor.data) : ''}
              placeholder="Escolher dia"
              icone="calendar-outline"
              aoPressionar={() => setSeletor('data')}
            />
          </View>
        </>
      )}

      <Text style={styles.rotulo}>Horário</Text>
      <View style={styles.linha}>
        <CampoToque
          rotulo="Início"
          valor={valor.horaInicio}
          placeholder="--:--"
          grande
          aoPressionar={() => abrirSeletorHora('inicio')}
        />
        <CampoToque
          rotulo="Fim (opcional)"
          valor={valor.horaFim}
          placeholder="--:--"
          grande
          aoPressionar={() => abrirSeletorHora('fim')}
        />
      </View>
      {horaValida(valor.horaInicio) && (
        <View style={styles.duracoes}>
          <DuracaoChips
            opcoes={DURACOES_COMPROMISSO}
            minutosAtuais={
              horaValida(valor.horaFim)
                ? duracaoEmMinutos(valor.horaInicio, valor.horaFim)
                : null
            }
            aoEscolher={(min) => atualizar('horaFim', somarMinutos(valor.horaInicio, min))}
          />
        </View>
      )}

      <Text style={styles.rotulo}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textoMultilinha]}
        placeholder="Observações"
        value={valor.observacoes}
        onChangeText={(v) => atualizar('observacoes', v)}
        multiline
      />

      <Text style={styles.rotulo}>Cor</Text>
      <View style={styles.cores}>
        {PALETA_MATERIAS.map((cor) => (
          <Pressable
            key={cor}
            onPress={() => atualizar('corHex', cor)}
            style={[
              styles.corSwatch,
              { backgroundColor: cor },
              valor.corHex === cor && styles.corSwatchSelecionada,
            ]}
          />
        ))}
      </View>

      {erro && <Text style={styles.erro}>{erro}</Text>}

      <Pressable style={styles.botaoSalvar} onPress={handleSalvar}>
        <Text style={styles.botaoSalvarTexto}>{rotuloBotao}</Text>
      </Pressable>
    </ScrollView>
      <DataPicker
        visivel={seletor === 'data'}
        titulo="Data do compromisso"
        valor={valor.data}
        aoFechar={() => setSeletor(null)}
        aoConfirmar={(data) => {
          atualizar('data', data);
          setSeletor(null);
        }}
      />
      <HoraPicker
        visivel={seletor === 'inicio' || seletor === 'fim'}
        titulo={seletor === 'fim' ? 'Fim do compromisso' : 'Início do compromisso'}
        valor={seletor === 'fim' ? valor.horaFim : valor.horaInicio}
        sugestoes={sugestoes}
        aoFechar={() => setSeletor(null)}
        aoConfirmar={(hora) => {
          if (seletor === 'inicio') {
            const duracao =
              horaValida(valor.horaInicio) && horaValida(valor.horaFim)
                ? duracaoEmMinutos(valor.horaInicio, valor.horaFim)
                : 0;
            setValor((atual) => ({
              ...atual,
              horaInicio: hora,
              horaFim: duracao > 0 ? somarMinutos(hora, duracao) : atual.horaFim,
            }));
          } else {
            atualizar('horaFim', hora);
          }
          setSeletor(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.xs,
    paddingBottom: 48,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 12.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  textoMultilinha: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linha: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  duracoes: {
    marginTop: spacing.sm,
  },
  metade: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipAtivoNeutro: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14,
    color: colors.ink,
  },
  chipTextoAtivo: {
    color: colors.surface,
  },
  cores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  corSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  corSwatchSelecionada: {
    borderColor: colors.ink,
  },
  erro: {
    fontFamily: font.bodyMedium,
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.md,
  },
  botaoSalvar: {
    backgroundColor: colors.brand,
    borderRadius: radii.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    color: colors.surface,
    fontSize: 16,
  },
});
