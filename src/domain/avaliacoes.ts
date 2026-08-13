import { asc, eq, sql } from 'drizzle-orm';

import { db } from '../db/client';
import { avaliacao, materia } from '../db/schema';

export type Avaliacao = typeof avaliacao.$inferSelect;
export type NovaAvaliacao = Omit<
  typeof avaliacao.$inferInsert,
  'id' | 'createdAt' | 'updatedAt'
>;
export type AvaliacaoComMateria = Avaliacao & {
  materiaNome: string;
  materiaCorHex: string;
  materiaInstituicao: string | null;
};

function validarPeso(peso: number) {
  if (peso <= 0) {
    throw new Error('O peso precisa ser maior que zero.');
  }
}

export function listAvaliacoesPorMateria(materiaId: number): Avaliacao[] {
  return db
    .select()
    .from(avaliacao)
    .where(eq(avaliacao.materiaId, materiaId))
    .orderBy(asc(avaliacao.data), asc(avaliacao.hora))
    .all();
}

function selecionarComMateria() {
  return db
    .select({
      id: avaliacao.id,
      materiaId: avaliacao.materiaId,
      tipo: avaliacao.tipo,
      titulo: avaliacao.titulo,
      data: avaliacao.data,
      hora: avaliacao.hora,
      peso: avaliacao.peso,
      nota: avaliacao.nota,
      notaMaxima: avaliacao.notaMaxima,
      diasAntesLembrete: avaliacao.diasAntesLembrete,
      observacoes: avaliacao.observacoes,
      createdAt: avaliacao.createdAt,
      updatedAt: avaliacao.updatedAt,
      materiaNome: materia.nome,
      materiaCorHex: materia.corHex,
      materiaInstituicao: materia.instituicao,
    })
    .from(avaliacao)
    .innerJoin(materia, eq(avaliacao.materiaId, materia.id));
}

/** Todas as avaliações do semestre, com nome/cor da matéria já anexados. */
export function listAvaliacoesPorSemestre(
  semestreId: number,
): AvaliacaoComMateria[] {
  return selecionarComMateria()
    .where(eq(materia.semestreId, semestreId))
    .orderBy(asc(materia.nome), asc(avaliacao.data), asc(avaliacao.hora))
    .all();
}

/** Avaliações de um dia específico (usada pela Timeline), com matéria anexada. */
export function listAvaliacoesPorData(data: string): AvaliacaoComMateria[] {
  return selecionarComMateria()
    .where(eq(avaliacao.data, data))
    .orderBy(asc(avaliacao.hora))
    .all();
}

export function getAvaliacao(id: number): Avaliacao | undefined {
  return db.select().from(avaliacao).where(eq(avaliacao.id, id)).get();
}

export function createAvaliacao(dados: NovaAvaliacao): Avaliacao {
  validarPeso(dados.peso);
  return db.insert(avaliacao).values(dados).returning().get();
}

export function updateAvaliacao(
  id: number,
  dados: Partial<NovaAvaliacao>,
): Avaliacao {
  if (dados.peso !== undefined) validarPeso(dados.peso);
  return db
    .update(avaliacao)
    .set({ ...dados, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(avaliacao.id, id))
    .returning()
    .get();
}

/** Atalho para lançar/editar apenas a nota de uma avaliação já criada. */
export function lancarNota(id: number, nota: number | null): Avaliacao {
  return updateAvaliacao(id, { nota });
}

export function deleteAvaliacao(id: number): void {
  db.delete(avaliacao).where(eq(avaliacao.id, id)).run();
}
