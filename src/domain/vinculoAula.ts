import { addDays, format, getDay, parseISO } from 'date-fns';

const ABREVIACAO_DIA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** A data (AAAA-MM-DD) cai num dos dias da semana (0 = domingo)? */
export function dataCaiNosDias(data: string, dias: number[]): boolean {
  return dias.includes(getDay(parseISO(data)));
}

/**
 * Primeira data a partir de `base` (inclusive) que cai num dos `dias` da semana.
 * Sem dias, devolve a própria base.
 */
export function proximaDataNosDias(base: string, dias: number[]): string {
  if (dias.length === 0) return base;
  let atual = parseISO(base);
  for (let i = 0; i < 7; i++) {
    if (dias.includes(getDay(atual))) return format(atual, 'yyyy-MM-dd');
    atual = addDays(atual, 1);
  }
  return base;
}

/** "seg 18:00–19:50" (com mais de um dia: "seg/qua 18:00–19:50"). */
export function rotuloDoHorario(horario: {
  diasSemana: number[];
  horaInicio: string;
  horaFim: string | null;
}): string {
  const dias = [1, 2, 3, 4, 5, 6, 0]
    .filter((d) => horario.diasSemana.includes(d))
    .map((d) => ABREVIACAO_DIA[d])
    .join('/');
  const faixa = horario.horaFim
    ? `${horario.horaInicio}–${horario.horaFim}`
    : horario.horaInicio;
  return dias ? `${dias} ${faixa}` : faixa;
}
