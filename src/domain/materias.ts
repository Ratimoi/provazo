import { asc, count, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { materia } from '../db/schema';

export type Materia = typeof materia.$inferSelect;

// Paleta fixa (seção 7 do plano) — atribuída por ordem de criação da matéria
// dentro do semestre, com opção de troca manual no formulário.
export const PALETA_MATERIAS = [
  '#3B82F6', // azul
  '#EF4444', // vermelho
  '#F59E0B', // âmbar
  '#8B5CF6', // roxo
  '#10B981', // verde
  '#EC4899', // rosa
  '#06B6D4', // ciano
  '#F97316', // laranja
  '#64748B', // slate
  '#84CC16', // lima
] as const;

function proximaCorDaPaleta(semestreId: number): string {
  const [{ total }] = db
    .select({ total: count() })
    .from(materia)
    .where(eq(materia.semestreId, semestreId))
    .all();
  return PALETA_MATERIAS[total % PALETA_MATERIAS.length];
}

export function listMateriasPorSemestre(semestreId: number): Materia[] {
  return db
    .select()
    .from(materia)
    .where(eq(materia.semestreId, semestreId))
    .orderBy(asc(materia.nome))
    .all();
}

export function getMateria(id: number): Materia | undefined {
  return db.select().from(materia).where(eq(materia.id, id)).get();
}

export function createMateria(
  semestreId: number,
  nome: string,
  corHex?: string,
  instituicao?: string | null,
): Materia {
  return db
    .insert(materia)
    .values({
      semestreId,
      nome,
      corHex: corHex ?? proximaCorDaPaleta(semestreId),
      instituicao: instituicao ?? null,
    })
    .returning()
    .get();
}

/** Instituições já usadas em algum semestre, pra sugerir nos formulários. */
export function listInstituicoesDistintas(): string[] {
  const linhas = db
    .selectDistinct({ instituicao: materia.instituicao })
    .from(materia)
    .orderBy(asc(materia.instituicao))
    .all();
  return linhas
    .map((l) => l.instituicao)
    .filter((v): v is string => v != null && v.trim().length > 0);
}

export function updateMateria(
  id: number,
  dados: Partial<Pick<Materia, 'nome' | 'corHex' | 'instituicao'>>,
): Materia {
  return db
    .update(materia)
    .set(dados)
    .where(eq(materia.id, id))
    .returning()
    .get();
}

export function deleteMateria(id: number): void {
  db.delete(materia).where(eq(materia.id, id)).run();
}
