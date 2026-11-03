import { and, eq, isNotNull, sql } from 'drizzle-orm';

import { db } from '../db/client';
import { avaliacao, materia } from '../db/schema';
import { mediaPonderada } from './mediaPonderada';

export type MediaPorMateria = {
  materiaId: number;
  materiaNome: string;
  corHex: string;
  media: number | null;
};

/**
 * Média ponderada de cada matéria de um semestre, numa única query agregada.
 * Cada nota é normalizada pela nota máxima da avaliação (escala de 0 a 10),
 * então provas de 0–10 e de 0–100 podem conviver na mesma matéria. Sem nota
 * máxima vale 10 e sem peso vale 1.
 */
export function listarMediasPorSemestre(semestreId: number): MediaPorMateria[] {
  return db
    .select({
      materiaId: materia.id,
      materiaNome: materia.nome,
      corHex: materia.corHex,
      somaNormalizada: sql<number | null>`sum(${avaliacao.nota} * 1.0 / coalesce(${avaliacao.notaMaxima}, 10) * coalesce(${avaliacao.peso}, 1))`,
      somaPesos: sql<number | null>`sum(coalesce(${avaliacao.peso}, 1))`,
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
      media: mediaPonderada(linha.somaNormalizada, linha.somaPesos),
    }));
}
