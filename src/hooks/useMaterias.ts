import { useQuery } from '@tanstack/react-query';

import { listMateriasPorSemestre } from '../domain/materias';

export function materiasQueryKey(semestreId: number) {
  return ['materias', semestreId] as const;
}

export function useMateriasPorSemestre(semestreId: number) {
  return useQuery({
    queryKey: materiasQueryKey(semestreId),
    queryFn: () => listMateriasPorSemestre(semestreId),
  });
}
