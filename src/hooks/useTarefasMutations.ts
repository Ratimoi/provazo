import { useMutation } from '@tanstack/react-query';

import {
  createTarefa,
  deleteTarefa,
  toggleTarefaConcluida,
  updateTarefa,
} from '../domain/tarefas';

export function useTarefasMutations() {
  const criar = useMutation({
    mutationFn: (titulo: string) => Promise.resolve(createTarefa(titulo)),
  });
  const alternar = useMutation({
    mutationFn: (v: { id: number; concluida: boolean }) =>
      Promise.resolve(toggleTarefaConcluida(v.id, v.concluida)),
  });
  const excluir = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteTarefa(id)),
  });
  const editar = useMutation({
    mutationFn: (v: {
      id: number;
      dados: { titulo: string; observacoes: string | null };
    }) => Promise.resolve(updateTarefa(v.id, v.dados)),
  });
  return { criar, alternar, excluir, editar };
}
