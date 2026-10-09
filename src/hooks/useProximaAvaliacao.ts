import { useQuery } from '@tanstack/react-query';

import { listAvaliacoesPendentes } from '../domain/avaliacoes';
import { formatarIso } from '../domain/periodo';

/** Próxima avaliação (de qualquer semestre) que ainda não tem nota. */
export function useProximaAvaliacao() {
  return useQuery({
    queryKey: ['proxima-avaliacao'],
    queryFn: () => listAvaliacoesPendentes(formatarIso(new Date()))[0] ?? null,
  });
}
