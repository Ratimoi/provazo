import { describe, expect, it } from 'vitest';

import { mensagemAmigavel } from '../erros';
import { normalizar } from '../texto';

describe('normalizar', () => {
  it('remove acentos, caixa e espaços das pontas', () => {
    expect(normalizar('  Cálculo II ')).toBe('calculo ii');
    expect(normalizar('Programação')).toBe('programacao');
  });
});

describe('mensagemAmigavel', () => {
  it('traduz violações do SQLite', () => {
    expect(
      mensagemAmigavel(new Error('UNIQUE constraint failed: materia.nome')),
    ).toBe('Essa matéria já existe nesse semestre.');
    expect(
      mensagemAmigavel(new Error('FOREIGN KEY constraint failed')),
    ).toContain('removido');
    expect(mensagemAmigavel('x')).toBeUndefined();
  });
});
