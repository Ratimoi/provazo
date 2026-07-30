import { and, asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { semestre } from '../db/schema';

export type Semestre = typeof semestre.$inferSelect;

export function listSemestresPorAno(anoId: number): Semestre[] {
  return db
    .select()
    .from(semestre)
    .where(eq(semestre.anoId, anoId))
    .orderBy(asc(semestre.numero))
    .all();
}

export function getSemestre(id: number): Semestre | undefined {
  return db.select().from(semestre).where(eq(semestre.id, id)).get();
}

export function createSemestre(anoId: number, numero: 1 | 2): Semestre {
  return db.insert(semestre).values({ anoId, numero }).returning().get();
}

/** Retorna o semestre (ano, número), criando-o se ainda não existir. */
export function getOrCreateSemestre(anoId: number, numero: 1 | 2): Semestre {
  const existente = db
    .select()
    .from(semestre)
    .where(and(eq(semestre.anoId, anoId), eq(semestre.numero, numero)))
    .get();
  return existente ?? createSemestre(anoId, numero);
}

export function deleteSemestre(id: number): void {
  db.delete(semestre).where(eq(semestre.id, id)).run();
}
