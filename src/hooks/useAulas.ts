import { useQuery } from '@tanstack/react-query';

import { listAulasPorSemestre } from '../domain/eventosRecorrentes';

export function aulasQueryKey(semestreId: number) {
  return ['aulas', semestreId] as const;
}

export function useAulasPorSemestre(semestreId: number) {
  return useQuery({
    queryKey: aulasQueryKey(semestreId),
    queryFn: () => listAulasPorSemestre(semestreId),
  });
}
