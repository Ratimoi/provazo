import { useQuery } from '@tanstack/react-query';

import { listAvaliacoesPorSemestre } from '../domain/avaliacoes';

export function avaliacoesQueryKey(semestreId: number) {
  return ['avaliacoes', semestreId] as const;
}

export function useAvaliacoesPorSemestre(semestreId: number) {
  return useQuery({
    queryKey: avaliacoesQueryKey(semestreId),
    queryFn: () => listAvaliacoesPorSemestre(semestreId),
  });
}
