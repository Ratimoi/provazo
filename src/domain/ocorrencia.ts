import { diasNoMes } from './validacao';

export type RegraRecorrencia = {
  frequencia: 'semanal' | 'mensal' | 'anual';
  /** Primeira ocorrência (AAAA-MM-DD). */
  dataBase: string;
  /** Só usado em 'semanal' (0 = domingo). */
  diasSemana: number[];
  /** Aula não olha pra `dataBase`: quem delimita é o semestre da matéria. */
  ehAula: boolean;
};

export function diaDaSemana(dataIso: string): number {
  // "T00:00:00" (sem Z) força o parse em horário local, não UTC —
  // senão o dia da semana pode sair errado perto da meia-noite.
  return new Date(`${dataIso}T00:00:00`).getDay();
}

/** Mesma divisão de `semestreAtualPadrao`: jan–jun = 1º, jul–dez = 2º. */
export function dataPertenceAoSemestre(
  dataIso: string,
  anoValor: number,
  numero: number,
): boolean {
  const ano = Number(dataIso.slice(0, 4));
  const mes = Number(dataIso.slice(5, 7));
  return ano === anoValor && (mes <= 6 ? 1 : 2) === numero;
}

/**
 * Diz se uma regra de recorrência cai em `dataIso`.
 * - Mensal no dia 31 cai no último dia dos meses curtos.
 * - Anual em 29/02 cai em 28/02 nos anos não bissextos.
 * - Eventos (que não são aulas) não aparecem antes da data base.
 */
export function ocorreNoDia(regra: RegraRecorrencia, dataIso: string): boolean {
  if (!regra.ehAula && dataIso < regra.dataBase) return false;

  const ano = Number(dataIso.slice(0, 4));
  const mes = Number(dataIso.slice(5, 7));
  const dia = Number(dataIso.slice(8, 10));

  if (regra.frequencia === 'semanal') {
    return regra.diasSemana.includes(diaDaSemana(dataIso));
  }

  const diaBase = Number(regra.dataBase.slice(8, 10));
  if (regra.frequencia === 'mensal') {
    return dia === Math.min(diaBase, diasNoMes(ano, mes));
  }

  const mesBase = Number(regra.dataBase.slice(5, 7));
  if (mes !== mesBase) return false;
  return dia === Math.min(diaBase, diasNoMes(ano, mes));
}
