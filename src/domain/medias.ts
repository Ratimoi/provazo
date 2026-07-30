import { and, eq, isNotNull, sql } from 'drizzle-orm';

import { db } from '../db/client';
import { avaliacao, materia } from '../db/schema';

/**
 * Média ponderada = Σ(nota × peso) / Σ(peso), considerando só avaliações
 * com nota lançada. Retorna null se a matéria ainda não tem nenhuma nota.
 */
export function calcularMediaPorMateria(materiaId: number): number | null {
  const linha = db
    .select({
      somaPonderada: sql<number | null>`sum(${avaliacao.nota} * ${avaliacao.peso})`,
      somaPesos: sql<number | null>`sum(${avaliacao.peso})`,
    })
    .from(avaliacao)
    .where(
      and(eq(avaliacao.materiaId, materiaId), isNotNull(avaliacao.nota)),
    )
    .get();

  if (!linha || !linha.somaPesos) return null;
  return linha.somaPonderada! / linha.somaPesos;
}

export type MediaPorMateria = {
  materiaId: number;
  materiaNome: string;
  corHex: string;
  media: number | null;
};

/** Média ponderada de cada matéria de um semestre, numa única query agregada. */
export function listarMediasPorSemestre(semestreId: number): MediaPorMateria[] {
  return db
    .select({
      materiaId: materia.id,
      materiaNome: materia.nome,
      corHex: materia.corHex,
      somaPonderada: sql<number | null>`sum(${avaliacao.nota} * ${avaliacao.peso})`,
      somaPesos: sql<number | null>`sum(${avaliacao.peso})`,
    })
    .from(materia)
    .leftJoin(
      avaliacao,
      and(eq(avaliacao.materiaId, materia.id), isNotNull(avaliacao.nota)),
    )
    .where(eq(materia.semestreId, semestreId))
    .groupBy(materia.id)
    .all()
    .map((linha) => ({
      materiaId: linha.materiaId,
      materiaNome: linha.materiaNome,
      corHex: linha.corHex,
      media: linha.somaPesos ? linha.somaPonderada! / linha.somaPesos : null,
    }));
}
