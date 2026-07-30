import { useQuery } from '@tanstack/react-query';

import { listCompromissosDoDia } from '../domain/timeline';

export function compromissosQueryKey(dataIso: string) {
  return ['compromissos', dataIso] as const;
}

export function useCompromissosDoDia(dataIso: string) {
  return useQuery({
    queryKey: compromissosQueryKey(dataIso),
    queryFn: () => listCompromissosDoDia(dataIso),
  });
}
