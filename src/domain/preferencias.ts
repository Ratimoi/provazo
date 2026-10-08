import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { preferencia } from '../db/schema';

export const PREFERENCIAS_PADRAO = {
  lembretesAtivos: '1',
  horaLembrete: '08:00',
} as const;

type Chave = keyof typeof PREFERENCIAS_PADRAO;

function ler(chave: Chave): string {
  const linha = db
    .select()
    .from(preferencia)
    .where(eq(preferencia.chave, chave))
    .get();
  return linha?.valor ?? PREFERENCIAS_PADRAO[chave];
}

function gravar(chave: Chave, valor: string): void {
  db.insert(preferencia)
    .values({ chave, valor })
    .onConflictDoUpdate({ target: preferencia.chave, set: { valor } })
    .run();
}

export function lembretesAtivos(): boolean {
  return ler('lembretesAtivos') === '1';
}

export function definirLembretesAtivos(ativos: boolean): void {
  gravar('lembretesAtivos', ativos ? '1' : '0');
}

/** Horário (HH:MM) em que o aviso "X dias antes" é disparado. */
export function horaLembrete(): string {
  return ler('horaLembrete');
}

export function definirHoraLembrete(hora: string): void {
  gravar('horaLembrete', hora);
}
