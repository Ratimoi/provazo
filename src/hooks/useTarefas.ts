import { useQuery } from '@tanstack/react-query';

import { listTarefas } from '../domain/tarefas';

export const TAREFAS_QUERY_KEY = ['tarefas'] as const;

export function useTarefas() {
  return useQuery({
    queryKey: TAREFAS_QUERY_KEY,
    queryFn: () => listTarefas(),
  });
}
