import { type UseQueryResult, useQueries } from '@tanstack/react-query';

import { type Compromisso, listCompromissosDoPeriodo } from '../domain/timeline';
import { segundasDoPeriodo, somarDias } from '../domain/periodo';

/** Uma semana (segunda a domingo) por consulta: trocar de dia dentro dela não vai ao banco. */
function chaveDaSemana(segunda: string) {
  return ['compromissos-semana', segunda] as const;
}

// Função fixa (fora do hook): o TanStack só recalcula o resultado quando os dados
// mudam, em vez de a cada renderização.
function juntarSemanas(
  resultados: UseQueryResult<Map<string, Compromisso[]>>[],
): Map<string, Compromisso[]> {
  const todos = new Map<string, Compromisso[]>();
  for (const r of resultados) {
    if (r.data) for (const [dia, lista] of r.data) todos.set(dia, lista);
  }
  return todos;
}

/**
 * Compromissos de cada dia entre `inicio` e `fim`, lidos por semana inteira e
 * guardados em cache. Pedir um período um pouco maior que a tela (±7 dias)
 * deixa a semana vizinha pronta antes de a pessoa deslizar até ela.
 */
export function useCompromissosDoPeriodo(
  inicio: string,
  fim: string,
): Map<string, Compromisso[]> {
  return useQueries({
    queries: segundasDoPeriodo(inicio, fim).map((segunda) => ({
      queryKey: chaveDaSemana(segunda),
      queryFn: () => listCompromissosDoPeriodo(segunda, somarDias(segunda, 6)),
    })),
    combine: juntarSemanas,
  });
}
