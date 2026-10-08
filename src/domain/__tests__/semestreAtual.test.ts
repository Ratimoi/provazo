import { describe, expect, it } from 'vitest';

import { semestreAdjacente, semestreAtualPadrao } from '../semestreAtual';

describe('semestreAtualPadrao', () => {
  it('jan–jun é o 1º semestre e jul–dez o 2º', () => {
    expect(semestreAtualPadrao(new Date(2026, 5, 30))).toEqual({ anoValor: 2026, numero: 1 });
    expect(semestreAtualPadrao(new Date(2026, 6, 1))).toEqual({ anoValor: 2026, numero: 2 });
  });
});

describe('semestreAdjacente', () => {
  it('avança e volta atravessando a virada do ano', () => {
    expect(semestreAdjacente({ anoValor: 2026, numero: 1 }, 1)).toEqual({ anoValor: 2026, numero: 2 });
    expect(semestreAdjacente({ anoValor: 2026, numero: 2 }, 1)).toEqual({ anoValor: 2027, numero: 1 });
    expect(semestreAdjacente({ anoValor: 2026, numero: 1 }, -1)).toEqual({ anoValor: 2025, numero: 2 });
    expect(semestreAdjacente({ anoValor: 2026, numero: 2 }, -1)).toEqual({ anoValor: 2026, numero: 1 });
  });
});
