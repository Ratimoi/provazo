import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { listHorariosUsados } from '../../domain/apoioSeletores';
import { mensagemAmigavel } from '../../domain/erros';
import { db } from '../../db/client';
import {
  createAula,
  deleteAula,
  getEventoRecorrente,
  type NovaAula,
  updateAula,
} from '../../domain/eventosRecorrentes';
import { duracaoEmMinutos, somarMinutos, validarHorario } from '../../domain/horarios';
import type { Compromisso } from '../../domain/timeline';
import { horaValida } from '../../domain/validacao';
import { colors, font, radii, spacing } from '../../theme/tokens';
import { BottomSheetModal } from '../ui/BottomSheetModal';
import { CampoToque } from '../ui/CampoToque';
import { ConfirmModal } from '../ui/ConfirmModal';
import { DURACOES_AULA, DuracaoChips } from '../ui/DuracaoChips';
import { HoraPicker } from '../ui/HoraPicker';

const DIAS = [
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
  { valor: 0, rotulo: 'Dom' },
];

/**
 * Edita uma aula tocada na Timeline: dia, horário e sala. A mudança vale pra
 * todas as semanas (a aula é uma série), e dá pra excluir a aula inteira.
 */
export function EditarAulaModal({
  visivel,
  aula,
  aoFechar,
}: {
  visivel: boolean;
  /** A aula tocada (um item da Timeline com origem recorrente e tipo aula). */
  aula: Compromisso | null;
  aoFechar: () => void;
}) {
  const [dias, setDias] = useState<number[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [seletor, setSeletor] = useState<'inicio' | 'fim' | null>(null);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    if (!visivel || !aula) return;
    const evento = getEventoRecorrente(aula.origemId);
    setDias(evento?.diasSemana ?? []);
    setHoraInicio(evento?.horaInicio ?? aula.horaInicio);
    setHoraFim(evento?.horaFim ?? aula.horaFim ?? '');
    setObservacoes(evento?.observacoes ?? '');
    setErroLocal(null);
  }, [visivel, aula]);

  const salvar = useMutation({
    mutationFn: (dados: NovaAula) => {
      try {
        // Cada dia marcado é uma aula separada: o primeiro atualiza esta aula e os
        // demais viram aulas novas, com o mesmo horário.
        const [primeiro, ...outros] = [...dados.diasSemana].sort(
          (a, b) => (a || 7) - (b || 7),
        );
        db.transaction(() => {
          updateAula(aula!.origemId, { ...dados, diasSemana: [primeiro] });
          for (const dia of outros) createAula({ ...dados, diasSemana: [dia] });
        });
        return Promise.resolve();
      } catch (e) {
        throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
      }
    },
    onSuccess: aoFechar,
  });

  const excluir = useMutation({
    mutationFn: () => Promise.resolve(deleteAula(aula!.origemId)),
    onSuccess: aoFechar,
  });

  if (!aula) return null;

  function alternarDia(dia: number) {
    setDias((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia],
    );
  }

  function escolherHora(hora: string) {
    if (seletor === 'inicio') {
      const duracao =
        horaValida(horaInicio) && horaValida(horaFim)
          ? duracaoEmMinutos(horaInicio, horaFim)
          : 100;
      setHoraInicio(hora);
      setHoraFim(somarMinutos(hora, duracao > 0 ? duracao : 100));
    } else {
      setHoraFim(hora);
    }
    setSeletor(null);
  }

  function handleSalvar() {
    if (!aula) return;
    if (dias.length === 0) {
      setErroLocal('Escolha pelo menos um dia da semana.');
      return;
    }
    const erroHorario = validarHorario({ diaSemana: dias[0], horaInicio, horaFim });
    if (erroHorario) {
      setErroLocal(erroHorario);
      return;
    }
    setErroLocal(null);
    salvar.mutate({
      materiaId: aula.materiaId!,
      titulo: aula.titulo,
      diasSemana: dias,
      horaInicio,
      horaFim,
      observacoes: observacoes.trim() || null,
    });
  }

  const duracaoAtual =
    horaValida(horaInicio) && horaValida(horaFim)
      ? duracaoEmMinutos(horaInicio, horaFim)
      : null;
  const textoErro = erroLocal ?? salvar.error?.message;

  return (
    <>
      <BottomSheetModal visivel={visivel && !confirmarExclusao} aoFechar={aoFechar}>
        <View style={styles.cabecalho}>
          <View style={styles.titulos}>
            <View style={styles.linhaTitulo}>
              <View style={[styles.ponto, { backgroundColor: aula.corHex }]} />
              <Text style={styles.titulo} numberOfLines={1}>
                {aula.titulo}
              </Text>
            </View>
            <Text style={styles.subtitulo}>
              Vale pra todas as semanas
              {aula.instituicao ? ` · ${aula.instituicao}` : ''}
            </Text>
          </View>
          <Pressable onPress={aoFechar} hitSlop={10}>
            <Text style={styles.fechar}>Cancelar</Text>
          </Pressable>
        </View>

        <Text style={styles.rotulo}>Dia da semana</Text>
        <Text style={styles.dicaDias}>
          {dias.length > 1
            ? `${dias.length} dias: cada um vira uma aula separada, no mesmo horário`
            : 'Marque mais de um dia pra repetir o mesmo horário'}
        </Text>
        <View style={styles.chipsDias}>
          {DIAS.map((d) => {
            const ativo = dias.includes(d.valor);
            return (
              <Pressable
                key={d.valor}
                onPress={() => alternarDia(d.valor)}
                style={[styles.chipDia, ativo && styles.chipDiaAtivo]}
              >
                <Text style={[styles.chipDiaTexto, ativo && styles.chipDiaTextoAtivo]}>
                  {d.rotulo}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.rotulo}>Horário</Text>
        <View style={styles.linhaHoras}>
          <CampoToque
            rotulo="Início"
            valor={horaInicio}
            placeholder="--:--"
            grande
            aoPressionar={() => {
              setSugestoes(listHorariosUsados());
              setSeletor('inicio');
            }}
          />
          <CampoToque
            rotulo="Fim"
            valor={horaFim}
            placeholder="--:--"
            grande
            aoPressionar={() => {
              setSugestoes(listHorariosUsados());
              setSeletor('fim');
            }}
          />
        </View>
        {horaValida(horaInicio) && (
          <View style={styles.duracoes}>
            <DuracaoChips
              opcoes={DURACOES_AULA}
              minutosAtuais={duracaoAtual}
              aoEscolher={(min) => setHoraFim(somarMinutos(horaInicio, min))}
              aoPersonalizar={() => {
                setSugestoes(listHorariosUsados());
                setSeletor('fim');
              }}
            />
          </View>
        )}

        <Text style={styles.rotulo}>Sala ou observação</Text>
        <TextInput
          style={styles.input}
          placeholder="Sala, prédio… (opcional)"
          placeholderTextColor={colors.inkSoft}
          value={observacoes}
          onChangeText={setObservacoes}
        />

        {textoErro && <Text style={styles.erro}>{textoErro}</Text>}

        <Pressable
          style={[styles.botaoSalvar, salvar.isPending && styles.botaoOcupado]}
          onPress={handleSalvar}
          disabled={salvar.isPending}
        >
          <Text style={styles.botaoSalvarTexto}>
            {salvar.isPending ? 'Salvando…' : 'Salvar alterações'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.botaoExcluir}
          onPress={() => setConfirmarExclusao(true)}
          disabled={excluir.isPending}
        >
          <Text style={styles.botaoExcluirTexto}>Excluir esta aula</Text>
        </Pressable>
      </BottomSheetModal>

      <HoraPicker
        visivel={seletor !== null}
        titulo={seletor === 'fim' ? 'Fim da aula' : 'Início da aula'}
        valor={seletor === 'fim' ? horaFim : horaInicio}
        sugestoes={sugestoes}
        aoFechar={() => setSeletor(null)}
        aoConfirmar={escolherHora}
      />
      <ConfirmModal
        visivel={confirmarExclusao}
        titulo="Excluir essa aula?"
        mensagem="Ela some da Timeline em todas as semanas. A matéria continua."
        textoConfirmar="Excluir"
        destrutivo
        aoConfirmar={() => {
          setConfirmarExclusao(false);
          excluir.mutate();
        }}
        aoCancelar={() => setConfirmarExclusao(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titulos: {
    flex: 1,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titulo: {
    flexShrink: 1,
    fontFamily: font.display,
    fontSize: 20,
    color: colors.ink,
  },
  subtitulo: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  fechar: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.inkSoft,
  },
  rotulo: {
    fontFamily: font.bodySemibold,
    fontSize: 11.5,
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  dicaDias: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  chipsDias: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  chipDia: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDiaAtivo: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipDiaTexto: {
    fontFamily: font.bodyMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  chipDiaTextoAtivo: {
    color: colors.surface,
  },
  linhaHoras: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  duracoes: {
    marginTop: spacing.sm,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  erro: {
    fontFamily: font.bodyMedium,
    fontSize: 14,
    color: colors.danger,
    marginTop: spacing.md,
  },
  botaoSalvar: {
    marginTop: spacing.lg,
    minHeight: 54,
    borderRadius: radii.md + 4,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoOcupado: {
    opacity: 0.7,
  },
  botaoSalvarTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 16,
    color: colors.surface,
  },
  botaoExcluir: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoExcluirTexto: {
    fontFamily: font.bodySemibold,
    fontSize: 14.5,
    color: colors.danger,
  },
});
