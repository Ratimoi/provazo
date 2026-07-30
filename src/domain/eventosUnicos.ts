import { asc, eq } from 'drizzle-orm';

import { db } from '../db/client';
import { eventoUnico } from '../db/schema';

export type EventoUnico = typeof eventoUnico.$inferSelect;
export type NovoEventoUnico = Omit<typeof eventoUnico.$inferInsert, 'id'>;

export function listEventosUnicosPorData(data: string): EventoUnico[] {
  return db
    .select()
    .from(eventoUnico)
    .where(eq(eventoUnico.data, data))
    .orderBy(asc(eventoUnico.horaInicio))
    .all();
}

export function getEventoUnico(id: number): EventoUnico | undefined {
  return db.select().from(eventoUnico).where(eq(eventoUnico.id, id)).get();
}

export function createEventoUnico(dados: NovoEventoUnico): EventoUnico {
  return db.insert(eventoUnico).values(dados).returning().get();
}

export function updateEventoUnico(
  id: number,
  dados: Partial<NovoEventoUnico>,
): EventoUnico {
  return db
    .update(eventoUnico)
    .set(dados)
    .where(eq(eventoUnico.id, id))
    .returning()
    .get();
}

export function deleteEventoUnico(id: number): void {
  db.delete(eventoUnico).where(eq(eventoUnico.id, id)).run();
}
