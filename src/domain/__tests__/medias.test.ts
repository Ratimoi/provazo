import { describe, expect, it } from 'vitest';

import { mediaPonderada } from '../mediaPonderada';

describe('mediaPonderada', () => {
  it('sem notas lançadas não há média', () => {
    expect(mediaPonderada(null, null)).toBeNull();
    expect(mediaPonderada(0, 0)).toBeNull();
  });

  it('nota 8/10 com peso 1 dá 8', () => {
    expect(mediaPonderada(0.8, 1)).toBeCloseTo(8);
  });

  it('normaliza escalas diferentes (8/10 peso 1 e 60/100 peso 1 → 7)', () => {
    const soma = 8 / 10 + 60 / 100;
    expect(mediaPonderada(soma, 2)).toBeCloseTo(7);
  });

  it('respeita os pesos', () => {
    const soma = (10 / 10) * 3 + (4 / 10) * 1;
    expect(mediaPonderada(soma, 4)).toBeCloseTo(8.5);
  });
});
