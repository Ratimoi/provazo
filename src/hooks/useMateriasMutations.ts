import { useMutation } from '@tanstack/react-query';

import { mensagemAmigavel } from '../domain/erros';
import {
  createMateriaComAulas,
  deleteMateria,
  type HorarioDaMateria,
  updateMateriaComAulas,
} from '../domain/materias';

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

export type DadosSalvarMateria = {
  nome: string;
  corHex: string;
  instituicao: string | null;
  horarios: HorarioDaMateria[];
};

export function useMateriasMutations(semestreId: number) {
  const criarMateria = useMutation({
    mutationFn: (v: DadosSalvarMateria) =>
      comMensagemAmigavel(() =>
        createMateriaComAulas(
          semestreId,
          { nome: nomeObrigatorio(v.nome), corHex: v.corHex, instituicao: v.instituicao },
          v.horarios,
        ),
      ),
  });

  const editarMateria = useMutation({
    mutationFn: (v: DadosSalvarMateria & { id: number }) =>
      comMensagemAmigavel(() =>
        updateMateriaComAulas(
          v.id,
          { nome: nomeObrigatorio(v.nome), corHex: v.corHex, instituicao: v.instituicao },
          v.horarios,
        ),
      ),
  });

  const excluirMateria = useMutation({
    mutationFn: (id: number) => Promise.resolve(deleteMateria(id)),
  });

  return { criarMateria, editarMateria, excluirMateria };
}
