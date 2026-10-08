import { useMutation } from '@tanstack/react-query';

import { mensagemAmigavel } from '../domain/erros';
import {
  createAula,
  deleteAula,
  NovaAula,
  updateAula,
} from '../domain/eventosRecorrentes';
import { createMateria, deleteMateria, updateMateria } from '../domain/materias';

/** Roda a escrita síncrona do banco e converte erros do SQLite em mensagem
 * legível. As consultas são invalidadas pelo listener global do banco. */
function comMensagemAmigavel<T>(escrita: () => T): Promise<T> {
  try {
    return Promise.resolve(escrita());
  } catch (e) {
    throw new Error(mensagemAmigavel(e) ?? 'Não foi possível salvar.');
  }
}

function nomeObrigatorio(nome: string): string {
  const limpo = nome.trim();
  if (limpo.length === 0) throw new Error('Dê um nome pra matéria.');
  return limpo;
}

export function useMateriasMutations(semestreId: number) {
  const criarMateria = useMutation({
    mutationFn: (v: {
      nome: string;
      corHex: string | null;
      instituicao: string | null;
    }) =>
      comMensagemAmigavel(() =>
        createMateria(
          semestreId,
          nomeObrigatorio(v.nome),
          v.corHex ?? undefined,
          v.instituicao,
        ),
      ),
  });

  const editarMateria = useMutation({
    mutationFn: (v: {
      id: number;
      nome: string;
      corHex: string;
      instituicao: string | null;
    }) =>
      comMensagemAmigavel(() =>
        updateMateria(v.id, {
          nome: nomeObrigatorio(v.nome),
          corHex: v.corHex,
          instituicao: v.instituicao,
        }),
      ),
  });

  const excluirMateria = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteMateria(id)),
  });

  const criarAula = useMutation({
    mutationFn: (dados: NovaAula) => comMensagemAmigavel(() => createAula(dados)),
  });

  const editarAula = useMutation({
    mutationFn: (v: { id: number; dados: NovaAula }) =>
      comMensagemAmigavel(() => updateAula(v.id, v.dados)),
  });

  const excluirAula = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteAula(id)),
  });

  return {
    criarMateria,
    editarMateria,
    excluirMateria,
    criarAula,
    editarAula,
    excluirAula,
  };
}
