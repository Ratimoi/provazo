import { describe, expect, it } from 'vitest';

import { agruparPorInstituicao } from '../agrupamento';

describe('agruparPorInstituicao', () => {
  it('ordena instituições e deixa as sem instituição por último', () => {
    const grupos = agruparPorInstituicao([
      { nome: 'A', instituicao: null },
      { nome: 'B', instituicao: 'UFRGS' },
      { nome: 'C', instituicao: 'PUCRS' },
      { nome: 'D', instituicao: 'UFRGS' },
      { nome: 'E', instituicao: '  ' },
    ]);
    expect(grupos.map((g) => g.instituicao)).toEqual(['PUCRS', 'UFRGS', null]);
    expect(grupos[1].itens.map((i) => i.nome)).toEqual(['B', 'D']);
    expect(grupos[2].itens.map((i) => i.nome)).toEqual(['A', 'E']);
  });

  it('lista vazia não gera grupos', () => {
    expect(agruparPorInstituicao([])).toEqual([]);
  });
});
