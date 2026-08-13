import { and, eq, inArray, sql } from 'drizzle-orm';

import { db } from '../db/client';
import {
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  materia,
} from '../db/schema';

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

function diaDaSemana(dataIso: string): number {
  // "T00:00:00" (sem Z) força o parse em horário local, não UTC —
  // senão o dia da semana pode sair errado perto da meia-noite.
  return new Date(`${dataIso}T00:00:00`).getDay();
}

const selecionarBase = () =>
  db
    .select({
      id: eventoRecorrente.id,
      titulo: eventoRecorrente.titulo,
      tipo: eventoRecorrente.tipo,
      corHex: eventoRecorrente.corHex,
      horaInicio: eventoRecorrente.horaInicio,
      horaFim: eventoRecorrente.horaFim,
      observacoes: eventoRecorrente.observacoes,
      materiaId: eventoRecorrente.materiaId,
      materiaNome: materia.nome,
      materiaCorHex: materia.corHex,
      materiaInstituicao: materia.instituicao,
    })
    .from(eventoRecorrente)
    .leftJoin(materia, eq(eventoRecorrente.materiaId, materia.id));

/**
 * Junta os eventos recorrentes (aulas semanais, aniversários/outros anuais)
 * que caem num dia específico, já excluindo exceções — seção 5 do plano.
 */
export function expandirEventosRecorrentesParaDia(
  dataIso: string,
): OcorrenciaRecorrente[] {
  const [, mes, dia] = dataIso.split('-');
  const diaSemana = diaDaSemana(dataIso);

  const semanais = selecionarBase()
    .innerJoin(
      eventoRecorrenteDiaSemana,
      eq(eventoRecorrenteDiaSemana.eventoRecorrenteId, eventoRecorrente.id),
    )
    .where(
      and(
        eq(eventoRecorrente.frequencia, 'semanal'),
        eq(eventoRecorrenteDiaSemana.diaSemana, diaSemana),
      ),
    )
    .all();

  const mensais = selecionarBase()
    .where(
      and(
        eq(eventoRecorrente.frequencia, 'mensal'),
        sql`strftime('%d', ${eventoRecorrente.dataBase}) = ${dia}`,
      ),
    )
    .all();

  const anuais = selecionarBase()
    .where(
      and(
        eq(eventoRecorrente.frequencia, 'anual'),
        sql`strftime('%m-%d', ${eventoRecorrente.dataBase}) = ${`${mes}-${dia}`}`,
      ),
    )
    .all();

  const candidatos = [...semanais, ...mensais, ...anuais];
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
