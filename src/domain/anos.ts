import { asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { ano } from '../db/schema';

export type Ano = typeof ano.$inferSelect;

export function listAnos(): Ano[] {
  return db.select().from(ano).orderBy(asc(ano.valor)).all();
}

export function createAno(valor: number): Ano {
  return db.insert(ano).values({ valor }).returning().get();
}

/** Retorna o ano com esse valor, criando-o se ainda não existir. */
export function getOrCreateAno(valor: number): Ano {
  const existente = db.select().from(ano).where(eq(ano.valor, valor)).get();
  return existente ?? createAno(valor);
}
