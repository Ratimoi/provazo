import { and, eq, gte, inArray, lte } from 'drizzle-orm';

import { db } from '../db/client';
import {
  ano,
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  materia,
  semestre,
} from '../db/schema';
import {
  chaveExcecao,
  expandirRecorrentesNasDatas,
  type OcorrenciaRecorrente,
  type RecorrenteCarregado,
} from './expansao';
import { datasDoPeriodo } from './periodo';

export type { OcorrenciaRecorrente } from './expansao';

/** Todos os eventos recorrentes, com matéria/semestre e dias da semana, numa leitura só. */
function carregarRecorrentes(): RecorrenteCarregado[] {
  const eventos = db
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
      materiaSemestreId: materia.semestreId,
      anoValor: ano.valor,
      semestreNumero: semestre.numero,
    })
    .from(eventoRecorrente)
    .leftJoin(materia, eq(eventoRecorrente.materiaId, materia.id))
    .leftJoin(semestre, eq(materia.semestreId, semestre.id))
    .leftJoin(ano, eq(semestre.anoId, ano.id))
    .all();
  if (eventos.length === 0) return [];

  const dias = db
    .select()
    .from(eventoRecorrenteDiaSemana)
    .where(
      inArray(
        eventoRecorrenteDiaSemana.eventoRecorrenteId,
        eventos.map((e) => e.id),
      ),
    )
    .all();
  const diasPorEvento = new Map<number, number[]>();
  for (const d of dias) {
    diasPorEvento.set(d.eventoRecorrenteId, [
      ...(diasPorEvento.get(d.eventoRecorrenteId) ?? []),
      d.diaSemana,
    ]);
  }
  return eventos.map((e) => ({ ...e, diasSemana: diasPorEvento.get(e.id) ?? [] }));
}

/**
 * Ocorrências dos eventos recorrentes em cada dia de `inicio` a `fim`. Carrega
 * os eventos e as exceções uma única vez e expande em memória, em vez de
 * consultar o banco dia a dia.
 */
export function expandirRecorrentesNoPeriodo(
  inicio: string,
  fim: string,
): Map<string, OcorrenciaRecorrente[]> {
  const datas = datasDoPeriodo(inicio, fim);
  const eventos = carregarRecorrentes();
  if (eventos.length === 0) {
    return new Map(datas.map((d) => [d, []]));
  }
  const excecoes = new Set(
    db
      .select({
        eventoRecorrenteId: eventoRecorrenteExcecao.eventoRecorrenteId,
        data: eventoRecorrenteExcecao.data,
      })
      .from(eventoRecorrenteExcecao)
      .where(and(gte(eventoRecorrenteExcecao.data, inicio), lte(eventoRecorrenteExcecao.data, fim)))
      .all()
      .map((e) => chaveExcecao(e.eventoRecorrenteId, e.data)),
  );
  return expandirRecorrentesNasDatas(eventos, excecoes, datas);
}

/** Ocorrências recorrentes de um único dia. */
export function expandirEventosRecorrentesParaDia(
  dataIso: string,
): OcorrenciaRecorrente[] {
  return expandirRecorrentesNoPeriodo(dataIso, dataIso).get(dataIso) ?? [];
}
