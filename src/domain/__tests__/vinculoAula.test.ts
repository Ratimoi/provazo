import { describe, expect, it } from 'vitest';

import { dataCaiNosDias, proximaDataNosDias, rotuloDoHorario } from '../vinculoAula';

// 2026-11-03 é uma terça-feira.
describe('dataCaiNosDias', () => {
  it('confere o dia da semana da data', () => {
    expect(dataCaiNosDias('2026-11-03', [2])).toBe(true);
    expect(dataCaiNosDias('2026-11-03', [1, 3])).toBe(false);
    expect(dataCaiNosDias('2026-11-08', [0])).toBe(true);
  });
});

describe('proximaDataNosDias', () => {
  it('mantém a base quando ela já cai num dia permitido', () => {
    expect(proximaDataNosDias('2026-11-03', [2, 4])).toBe('2026-11-03');
  });

  it('avança até o próximo dia permitido', () => {
    expect(proximaDataNosDias('2026-11-03', [1])).toBe('2026-11-09');
    expect(proximaDataNosDias('2026-11-03', [4, 5])).toBe('2026-11-05');
  });

  it('atravessa a virada de mês e de ano', () => {
    expect(proximaDataNosDias('2026-12-31', [1])).toBe('2027-01-04');
  });

  it('sem dias, devolve a base', () => {
    expect(proximaDataNosDias('2026-11-03', [])).toBe('2026-11-03');
  });
});

describe('rotuloDoHorario', () => {
  it('monta dia e faixa de horas', () => {
    expect(
      rotuloDoHorario({ diasSemana: [1], horaInicio: '18:00', horaFim: '19:50' }),
    ).toBe('seg 18:00–19:50');
  });

  it('junta vários dias na ordem da semana (domingo por último)', () => {
    expect(
      rotuloDoHorario({ diasSemana: [0, 3, 1], horaInicio: '08:00', horaFim: '09:40' }),
    ).toBe('seg/qua/dom 08:00–09:40');
  });

  it('aceita horário sem fim', () => {
    expect(
      rotuloDoHorario({ diasSemana: [5], horaInicio: '14:00', horaFim: null }),
    ).toBe('sex 14:00');
  });
});
