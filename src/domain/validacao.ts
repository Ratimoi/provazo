const REGEX_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const REGEX_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Data AAAA-MM-DD que existe no calendário (rejeita 2026-02-31, 2026-13-01…). */
export function dataValida(texto: string): boolean {
  const partes = REGEX_DATA.exec(texto);
  if (!partes) return false;
  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  if (mes < 1 || mes > 12 || dia < 1) return false;
  return dia <= diasNoMes(ano, mes);
}

/** Horário HH:MM entre 00:00 e 23:59. */
export function horaValida(texto: string): boolean {
  return REGEX_HORA.test(texto);
}

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** Fim estritamente depois do início (não suporta eventos que viram a meia-noite). */
export function horaFimDepoisDeInicio(inicio: string, fim: string): boolean {
  return minutos(fim) > minutos(inicio);
}

/** Nota entre 0 e a nota máxima da avaliação. */
export function notaValida(nota: number, notaMaxima: number): boolean {
  return Number.isFinite(nota) && nota >= 0 && nota <= notaMaxima;
}

export function ehAnoBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

export function diasNoMes(ano: number, mes: number): number {
  if (mes === 2) return ehAnoBissexto(ano) ? 29 : 28;
  return [4, 6, 9, 11].includes(mes) ? 30 : 31;
}
