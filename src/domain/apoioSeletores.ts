import { and, gte, lte } from 'drizzle-orm';

import { db } from '../db/client';
import { avaliacao, eventoRecorrente, eventoUnico } from '../db/schema';
import { diasNoMes } from './validacao';

/** Horários (HH:MM) já usados em aulas, avaliações e compromissos, os mais frequentes primeiro. */
export function listHorariosUsados(limite = 6): string[] {
  const contagem = new Map<string, number>();
  const somar = (hora: string | null) => {
    if (hora) contagem.set(hora, (contagem.get(hora) ?? 0) + 1);
  };
  for (const linha of db
    .select({ inicio: eventoRecorrente.horaInicio, fim: eventoRecorrente.horaFim })
    .from(eventoRecorrente)
    .all()) {
    somar(linha.inicio);
    somar(linha.fim);
  }
  for (const linha of db.select({ hora: avaliacao.hora }).from(avaliacao).all()) {
    somar(linha.hora);
  }
  for (const linha of db
    .select({ inicio: eventoUnico.horaInicio, fim: eventoUnico.horaFim })
    .from(eventoUnico)
    .all()) {
    somar(linha.inicio);
    somar(linha.fim);
  }
  return [...contagem.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limite)
    .map(([hora]) => hora)
    .sort();
}

/** Datas (AAAA-MM-DD) do mês que já têm prova, trabalho ou compromisso avulso. */
export function datasComEventos(ano: number, mes: number): Set<string> {
  const prefixo = `${ano}-${String(mes).padStart(2, '0')}`;
  const inicio = `${prefixo}-01`;
  const fim = `${prefixo}-${String(diasNoMes(ano, mes)).padStart(2, '0')}`;
  const datas = new Set<string>();
  for (const l of db
    .select({ data: avaliacao.data })
    .from(avaliacao)
    .where(and(gte(avaliacao.data, inicio), lte(avaliacao.data, fim)))
    .all()) {
    datas.add(l.data);
  }
  for (const l of db
    .select({ data: eventoUnico.data })
    .from(eventoUnico)
    .where(and(gte(eventoUnico.data, inicio), lte(eventoUnico.data, fim)))
    .all()) {
    datas.add(l.data);
  }
  return datas;
}
