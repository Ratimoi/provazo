import { and, asc, eq, inArray } from 'drizzle-orm';

import { db } from '../db/client';
import {
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  materia,
} from '../db/schema';

export type EventoRecorrente = typeof eventoRecorrente.$inferSelect;

const ABREVIACAO_DIA: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export function formatarDiasSemana(dias: number[]): string {
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return ordem
    .filter((d) => dias.includes(d))
    .map((d) => ABREVIACAO_DIA[d])
    .join('/');
}

export type Aula = {
  id: number;
  titulo: string;
  materiaId: number;
  materiaNome: string;
  materiaCorHex: string;
  horaInicio: string;
  horaFim: string | null;
  observacoes: string | null;
  diasSemana: number[];
};

/** Aulas (evento_recorrente tipo 'aula') de todas as matérias de um semestre. */
export function listAulasPorSemestre(semestreId: number): Aula[] {
  const aulas = db
    .select({
      id: eventoRecorrente.id,
      titulo: eventoRecorrente.titulo,
      materiaId: eventoRecorrente.materiaId,
      horaInicio: eventoRecorrente.horaInicio,
      horaFim: eventoRecorrente.horaFim,
      observacoes: eventoRecorrente.observacoes,
      materiaNome: materia.nome,
      materiaCorHex: materia.corHex,
    })
    .from(eventoRecorrente)
    .innerJoin(materia, eq(eventoRecorrente.materiaId, materia.id))
    .where(
      and(eq(materia.semestreId, semestreId), eq(eventoRecorrente.tipo, 'aula')),
    )
    .orderBy(asc(eventoRecorrente.horaInicio))
    .all();

  if (aulas.length === 0) return [];

  const dias = db
    .select()
    .from(eventoRecorrenteDiaSemana)
    .where(
      inArray(
        eventoRecorrenteDiaSemana.eventoRecorrenteId,
        aulas.map((a) => a.id),
      ),
    )
    .all();

  const diasPorAula = new Map<number, number[]>();
  for (const d of dias) {
    const lista = diasPorAula.get(d.eventoRecorrenteId) ?? [];
    lista.push(d.diaSemana);
    diasPorAula.set(d.eventoRecorrenteId, lista);
  }

  return aulas.map((a) => ({
    ...a,
    materiaId: a.materiaId!,
    diasSemana: (diasPorAula.get(a.id) ?? []).sort(),
  }));
}

export type NovaAula = {
  materiaId: number;
  titulo: string;
  diasSemana: number[];
  horaInicio: string;
  // Diferente do evento avulso/avaliação: uma aula de matéria real sempre
  // tem início e fim definidos, então aqui é obrigatório.
  horaFim: string;
  observacoes: string | null;
};

export function createAula(dados: NovaAula): Aula {
  const evento = db
    .insert(eventoRecorrente)
    .values({
      titulo: dados.titulo,
      tipo: 'aula',
      materiaId: dados.materiaId,
      corHex: null,
      frequencia: 'semanal',
      // não é usado para recorrência semanal, mas a coluna é obrigatória
      dataBase: new Date().toISOString().slice(0, 10),
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
      observacoes: dados.observacoes,
    })
    .returning()
    .get();

  if (dados.diasSemana.length > 0) {
    db.insert(eventoRecorrenteDiaSemana)
      .values(
        dados.diasSemana.map((diaSemana) => ({
          eventoRecorrenteId: evento.id,
          diaSemana,
        })),
      )
      .run();
  }

  const materiaVinculada = db
    .select({ nome: materia.nome, corHex: materia.corHex })
    .from(materia)
    .where(eq(materia.id, dados.materiaId))
    .get()!;

  return {
    id: evento.id,
    titulo: evento.titulo,
    materiaId: dados.materiaId,
    materiaNome: materiaVinculada.nome,
    materiaCorHex: materiaVinculada.corHex,
    horaInicio: evento.horaInicio,
    horaFim: evento.horaFim,
    observacoes: evento.observacoes,
    diasSemana: dados.diasSemana,
  };
}

/** Atualiza uma aula existente, incluindo os dias da semana (apaga e recria). */
export function updateAula(id: number, dados: NovaAula): Aula {
  const evento = db
    .update(eventoRecorrente)
    .set({
      titulo: dados.titulo,
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
      observacoes: dados.observacoes,
    })
    .where(eq(eventoRecorrente.id, id))
    .returning()
    .get();

  db.delete(eventoRecorrenteDiaSemana)
    .where(eq(eventoRecorrenteDiaSemana.eventoRecorrenteId, id))
    .run();
  if (dados.diasSemana.length > 0) {
    db.insert(eventoRecorrenteDiaSemana)
      .values(
        dados.diasSemana.map((diaSemana) => ({
          eventoRecorrenteId: id,
          diaSemana,
        })),
      )
      .run();
  }

  const materiaVinculada = db
    .select({ nome: materia.nome, corHex: materia.corHex })
    .from(materia)
    .where(eq(materia.id, dados.materiaId))
    .get()!;

  return {
    id: evento.id,
    titulo: evento.titulo,
    materiaId: dados.materiaId,
    materiaNome: materiaVinculada.nome,
    materiaCorHex: materiaVinculada.corHex,
    horaInicio: evento.horaInicio,
    horaFim: evento.horaFim,
    observacoes: evento.observacoes,
    diasSemana: dados.diasSemana,
  };
}

export function deleteAula(id: number): void {
  db.delete(eventoRecorrente).where(eq(eventoRecorrente.id, id)).run();
}

export type FrequenciaRecorrencia = 'semanal' | 'mensal' | 'anual';

export type NovoEventoRecorrentePessoal = {
  titulo: string;
  corHex: string;
  frequencia: FrequenciaRecorrencia;
  /** Primeira ocorrência (AAAA-MM-DD) — define o dia da semana/mês/ano em que ele se repete. */
  dataBase: string;
  horaInicio: string;
  horaFim: string | null;
};

/** Cria um compromisso pessoal que se repete (evento_recorrente tipo 'outro'). */
export function createEventoRecorrentePessoal(
  dados: NovoEventoRecorrentePessoal,
): EventoRecorrente {
  const evento = db
    .insert(eventoRecorrente)
    .values({
      titulo: dados.titulo,
      tipo: 'outro',
      materiaId: null,
      corHex: dados.corHex,
      frequencia: dados.frequencia,
      dataBase: dados.dataBase,
      horaInicio: dados.horaInicio,
      horaFim: dados.horaFim,
    })
    .returning()
    .get();

  if (dados.frequencia === 'semanal') {
    const diaSemana = new Date(`${dados.dataBase}T00:00:00`).getDay();
    db.insert(eventoRecorrenteDiaSemana)
      .values({ eventoRecorrenteId: evento.id, diaSemana })
      .run();
  }

  return evento;
}

/** Marca uma data específica pra essa aula não aparecer (feriado, aula cancelada). */
export function pularOcorrencia(eventoRecorrenteId: number, data: string): void {
  db.insert(eventoRecorrenteExcecao)
    .values({ eventoRecorrenteId, data })
    .run();
}
