import { and, eq, inArray } from 'drizzle-orm';

import { db } from '../db/client';
import {
  ano,
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  materia,
  semestre,
} from '../db/schema';
import { dataPertenceAoSemestre, ocorreNoDia } from './ocorrencia';

export type OcorrenciaRecorrente = {
  id: string;
  eventoRecorrenteId: number;
  tipo: 'aula' | 'aniversario' | 'outro';
  titulo: string;
  corHex: string;
  horaInicio: string;
  horaFim: string | null;
  observacoes: string | null;
  materiaId?: number;
  materiaNome?: string;
  materiaInstituicao?: string | null;
};

const selecionarBase = () =>
  db
    .select({
      id: eventoRecorrente.id,
      titulo: eventoRecorrente.titulo,
      tipo: eventoRecorrente.tipo,
      frequencia: eventoRecorrente.frequencia,
      dataBase: eventoRecorrente.dataBase,
      corHex: eventoRecorrente.corHex,
      horaInicio: eventoRecorrente.horaInicio,
      horaFim: eventoRecorrente.horaFim,
      observacoes: eventoRecorrente.observacoes,
      materiaId: eventoRecorrente.materiaId,
      materiaNome: materia.nome,
      materiaCorHex: materia.corHex,
      materiaInstituicao: materia.instituicao,
      anoValor: ano.valor,
      semestreNumero: semestre.numero,
    })
    .from(eventoRecorrente)
    .leftJoin(materia, eq(eventoRecorrente.materiaId, materia.id))
    .leftJoin(semestre, eq(materia.semestreId, semestre.id))
    .leftJoin(ano, eq(semestre.anoId, ano.id));

/**
 * Junta os eventos recorrentes (aulas semanais, compromissos semanais,
 * mensais e anuais) que caem num dia específico, já excluindo exceções —
 * seção 5 do plano. Aulas só aparecem dentro do semestre da matéria.
 */
export function expandirEventosRecorrentesParaDia(
  dataIso: string,
): OcorrenciaRecorrente[] {
  const todos = selecionarBase().all();
  if (todos.length === 0) return [];

  const dias = db
    .select()
    .from(eventoRecorrenteDiaSemana)
    .where(
      inArray(
        eventoRecorrenteDiaSemana.eventoRecorrenteId,
        todos.map((t) => t.id),
      ),
    )
    .all();
  const diasPorEvento = new Map<number, number[]>();
  for (const d of dias) {
    const lista = diasPorEvento.get(d.eventoRecorrenteId) ?? [];
    lista.push(d.diaSemana);
    diasPorEvento.set(d.eventoRecorrenteId, lista);
  }

  const candidatos = todos.filter((t) => {
    const ehAula = t.tipo === 'aula';
    if (
      ehAula &&
      (t.anoValor == null ||
        t.semestreNumero == null ||
        !dataPertenceAoSemestre(dataIso, t.anoValor, t.semestreNumero))
    ) {
      return false;
    }
    return ocorreNoDia(
      {
        frequencia: t.frequencia,
        dataBase: t.dataBase,
        diasSemana: diasPorEvento.get(t.id) ?? [],
        ehAula,
      },
      dataIso,
    );
  });
  if (candidatos.length === 0) return [];

  const excecoes = db
    .select({ eventoRecorrenteId: eventoRecorrenteExcecao.eventoRecorrenteId })
    .from(eventoRecorrenteExcecao)
    .where(
      and(
        inArray(
          eventoRecorrenteExcecao.eventoRecorrenteId,
          candidatos.map((c) => c.id),
        ),
        eq(eventoRecorrenteExcecao.data, dataIso),
      ),
    )
    .all();
  const idsExcluidos = new Set(excecoes.map((e) => e.eventoRecorrenteId));

  return candidatos
    .filter((c) => !idsExcluidos.has(c.id))
    .map((c) => ({
      id: `recorrente-${c.id}`,
      eventoRecorrenteId: c.id,
      tipo: c.tipo,
      titulo: c.titulo,
      corHex: (c.tipo === 'aula' ? c.materiaCorHex : c.corHex)!,
      horaInicio: c.horaInicio,
      horaFim: c.horaFim,
      observacoes: c.observacoes,
      materiaId: c.materiaId ?? undefined,
      materiaNome: c.materiaNome ?? undefined,
      materiaInstituicao: c.materiaInstituicao,
    }));
}
