import { asc, count, eq, lt } from 'drizzle-orm';

import { db } from '../db/client';
import {
  ano,
  avaliacao,
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  eventoUnico,
  materia,
  semestre,
  tarefa,
} from '../db/schema';

export type ResumoDados = {
  materias: number;
  avaliacoes: number;
  aulas: number;
  compromissosAvulsos: number;
  tarefas: number;
};

function total(consulta: { get(): { total: number } | undefined }): number {
  return consulta.get()?.total ?? 0;
}

/** Contagem geral dos dados guardados, pra dar contexto antes de qualquer exclusão. */
export function contarDados(): ResumoDados {
  return {
    materias: total(db.select({ total: count() }).from(materia)),
    avaliacoes: total(db.select({ total: count() }).from(avaliacao)),
    aulas: total(db.select({ total: count() }).from(eventoRecorrente)),
    compromissosAvulsos: total(db.select({ total: count() }).from(eventoUnico)),
    tarefas: total(db.select({ total: count() }).from(tarefa)),
  };
}

export type SemestreComContagem = {
  id: number;
  anoValor: number;
  numero: number;
  materias: number;
};

/** Todos os semestres já criados (qualquer ano), com quantas matérias cada um tem. */
export function listTodosSemestres(): SemestreComContagem[] {
  const linhas = db
    .select({
      id: semestre.id,
      anoValor: ano.valor,
      numero: semestre.numero,
    })
    .from(semestre)
    .innerJoin(ano, eq(semestre.anoId, ano.id))
    .orderBy(asc(ano.valor), asc(semestre.numero))
    .all();

  return linhas.map((s) => ({
    ...s,
    materias: total(
      db.select({ total: count() }).from(materia).where(eq(materia.semestreId, s.id)),
    ),
  }));
}

export function contarAvaliacoesAntesDe(dataCorte: string): number {
  return total(
    db.select({ total: count() }).from(avaliacao).where(lt(avaliacao.data, dataCorte)),
  );
}

export function apagarAvaliacoesAntesDe(dataCorte: string): number {
  const qtd = contarAvaliacoesAntesDe(dataCorte);
  db.delete(avaliacao).where(lt(avaliacao.data, dataCorte)).run();
  return qtd;
}

export function contarTarefasConcluidas(): number {
  return total(
    db.select({ total: count() }).from(tarefa).where(eq(tarefa.concluida, true)),
  );
}

export function apagarTarefasConcluidas(): number {
  const qtd = contarTarefasConcluidas();
  db.delete(tarefa).where(eq(tarefa.concluida, true)).run();
  return qtd;
}

/** Apaga TODOS os dados do app (matérias, avaliações, aulas, compromissos,
 * tarefas) e volta pro estado de instalação nova. Não afeta preferências
 * do dispositivo (tema, permissões etc), só o banco local. */
export function restaurarPadraoDeFabrica(): void {
  db.delete(eventoRecorrenteExcecao).run();
  db.delete(eventoRecorrenteDiaSemana).run();
  db.delete(eventoRecorrente).run();
  db.delete(eventoUnico).run();
  db.delete(avaliacao).run();
  db.delete(materia).run();
  db.delete(semestre).run();
  db.delete(ano).run();
  db.delete(tarefa).run();
}
