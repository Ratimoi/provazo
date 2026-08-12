import { asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { tarefa } from '../db/schema';

export type Tarefa = typeof tarefa.$inferSelect;

/** Pendentes primeiro (mais recentes no topo), concluídas por último. */
export function listTarefas(): Tarefa[] {
  return db
    .select()
    .from(tarefa)
    .orderBy(asc(tarefa.concluida), asc(tarefa.createdAt))
    .all();
}

export function createTarefa(titulo: string, observacoes?: string | null): Tarefa {
  return db
    .insert(tarefa)
    .values({ titulo, observacoes: observacoes ?? null })
    .returning()
    .get();
}

export function toggleTarefaConcluida(id: number, concluida: boolean): Tarefa {
  return db
    .update(tarefa)
    .set({ concluida })
    .where(eq(tarefa.id, id))
    .returning()
    .get();
}

export function deleteTarefa(id: number): void {
  db.delete(tarefa).where(eq(tarefa.id, id)).run();
}
