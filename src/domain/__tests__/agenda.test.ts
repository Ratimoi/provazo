import { describe, expect, it } from 'vitest';

import { atribuirColunas } from '../agenda';

describe('atribuirColunas', () => {
  it('itens que não se sobrepõem ficam sozinhos em uma coluna', () => {
    const r = atribuirColunas([
      { id: 'a', inicioMin: 0, fimMin: 60 },
      { id: 'b', inicioMin: 60, fimMin: 120 },
    ]);
    expect(r.get('a')).toEqual({ coluna: 0, totalColunas: 1 });
    expect(r.get('b')).toEqual({ coluna: 0, totalColunas: 1 });
  });

  it('sobreposição divide a largura em colunas', () => {
    const r = atribuirColunas([
      { id: 'a', inicioMin: 0, fimMin: 90 },
      { id: 'b', inicioMin: 30, fimMin: 120 },
    ]);
    expect(r.get('a')).toEqual({ coluna: 0, totalColunas: 2 });
    expect(r.get('b')).toEqual({ coluna: 1, totalColunas: 2 });
  });

  it('reaproveita a coluna quando um item já terminou', () => {
    const r = atribuirColunas([
      { id: 'a', inicioMin: 0, fimMin: 60 },
      { id: 'b', inicioMin: 30, fimMin: 120 },
      { id: 'c', inicioMin: 60, fimMin: 90 },
    ]);
    expect(r.get('c')).toEqual({ coluna: 0, totalColunas: 2 });
  });
});
