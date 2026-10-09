import { addDays, eachDayOfInterval, format, parseISO, startOfWeek } from 'date-fns';

export function formatarIso(data: Date): string {
  return format(data, 'yyyy-MM-dd');
}

/** Todas as datas (AAAA-MM-DD) de `inicio` a `fim`, inclusive. */
export function datasDoPeriodo(inicio: string, fim: string): string[] {
  return eachDayOfInterval({ start: parseISO(inicio), end: parseISO(fim) }).map(
    formatarIso,
  );
}

/** Segunda-feira da semana (segunda a domingo) que contém a data. */
export function segundaDaSemana(dataIso: string): string {
  return formatarIso(startOfWeek(parseISO(dataIso), { weekStartsOn: 1 }));
}

/** Segundas-feiras das semanas que cobrem de `inicio` a `fim`. */
export function segundasDoPeriodo(inicio: string, fim: string): string[] {
  const segundas: string[] = [];
  let atual = segundaDaSemana(inicio);
  while (atual <= fim) {
    segundas.push(atual);
    atual = formatarIso(addDays(parseISO(atual), 7));
  }
  return segundas;
}

export function somarDias(dataIso: string, dias: number): string {
  return formatarIso(addDays(parseISO(dataIso), dias));
}
