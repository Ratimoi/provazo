import { and, asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { eventoRecorrente, materia } from '../db/schema';
import { createAula, deleteAula, updateAula } from './eventosRecorrentes';

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

/** Cor da paleta menos usada no semestre (a primeira em caso de empate), pra
 * não repetir cor depois de matérias excluídas. */
export function proximaCorDaPaleta(semestreId: number): string {
  const usadas = db
    .select({ corHex: materia.corHex })
    .from(materia)
    .where(eq(materia.semestreId, semestreId))
    .all();
  const usosPorCor = new Map<string, number>();
  for (const { corHex } of usadas) {
    usosPorCor.set(corHex, (usosPorCor.get(corHex) ?? 0) + 1);
  }
  let melhor: string = PALETA_MATERIAS[0];
  let menorUso = Infinity;
  for (const cor of PALETA_MATERIAS) {
    const uso = usosPorCor.get(cor) ?? 0;
    if (uso < menorUso) {
      melhor = cor;
      menorUso = uso;
    }
  }
  return melhor;
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

/** Um horário de aula semanal de uma matéria (o `id` só existe se já foi salvo). */
export type HorarioDaMateria = {
  id?: number;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  observacoes: string | null;
};

export type DadosDaMateria = {
  nome: string;
  corHex?: string;
  instituicao: string | null;
};

/** Cria a matéria e todos os horários de aula de uma vez (tudo ou nada). */
export function createMateriaComAulas(
  semestreId: number,
  dados: DadosDaMateria,
  horarios: HorarioDaMateria[],
): Materia {
  return db.transaction(() => {
    const nova = createMateria(
      semestreId,
      dados.nome,
      dados.corHex,
      dados.instituicao,
    );
    for (const h of horarios) {
      createAula({
        materiaId: nova.id,
        titulo: nova.nome,
        diasSemana: [h.diaSemana],
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
        observacoes: h.observacoes,
      });
    }
    return nova;
  });
}

/**
 * Atualiza a matéria e sincroniza os horários: os que já tinham `id` são
 * atualizados, os novos criados e os que sumiram da lista, apagados.
 */
export function updateMateriaComAulas(
  id: number,
  dados: Required<Pick<DadosDaMateria, 'corHex'>> & DadosDaMateria,
  horarios: HorarioDaMateria[],
): Materia {
  return db.transaction(() => {
    const atualizada = updateMateria(id, {
      nome: dados.nome,
      corHex: dados.corHex,
      instituicao: dados.instituicao,
    });

    const existentes = db
      .select({ id: eventoRecorrente.id })
      .from(eventoRecorrente)
      .where(and(eq(eventoRecorrente.materiaId, id), eq(eventoRecorrente.tipo, 'aula')))
      .all()
      .map((e) => e.id);
    const mantidos = new Set(horarios.flatMap((h) => (h.id != null ? [h.id] : [])));

    for (const idAula of existentes) {
      if (!mantidos.has(idAula)) deleteAula(idAula);
    }
    for (const h of horarios) {
      const aula = {
        materiaId: id,
        titulo: atualizada.nome,
        diasSemana: [h.diaSemana],
        horaInicio: h.horaInicio,
        horaFim: h.horaFim,
        observacoes: h.observacoes,
      };
      if (h.id != null && existentes.includes(h.id)) updateAula(h.id, aula);
      else createAula(aula);
    }
    return atualizada;
  });
}
