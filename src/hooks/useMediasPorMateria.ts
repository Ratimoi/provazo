import { useQuery } from '@tanstack/react-query';

import { listarMediasPorSemestre } from '../domain/medias';

export function mediasQueryKey(semestreId: number) {
  return ['medias', semestreId] as const;
}

export function useMediasPorMateria(semestreId: number) {
  return useQuery({
    queryKey: mediasQueryKey(semestreId),
    queryFn: () => listarMediasPorSemestre(semestreId),
  });
}
