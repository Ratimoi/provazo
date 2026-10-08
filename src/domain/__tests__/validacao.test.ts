import { describe, expect, it } from 'vitest';

import {
  dataValida,
  diasNoMes,
  horaFimDepoisDeInicio,
  horaValida,
  notaValida,
} from '../validacao';

describe('dataValida', () => {
  it('aceita datas reais', () => {
    expect(dataValida('2026-10-08')).toBe(true);
    expect(dataValida('2028-02-29')).toBe(true);
  });
  it('rejeita datas impossíveis', () => {
    expect(dataValida('2026-02-31')).toBe(false);
    expect(dataValida('2027-02-29')).toBe(false);
    expect(dataValida('2026-13-01')).toBe(false);
    expect(dataValida('2026-00-10')).toBe(false);
    expect(dataValida('2026-10-00')).toBe(false);
    expect(dataValida('2026-1-1')).toBe(false);
  });
});

describe('horaValida', () => {
  it('limites do dia', () => {
    expect(horaValida('00:00')).toBe(true);
    expect(horaValida('23:59')).toBe(true);
    expect(horaValida('24:00')).toBe(false);
    expect(horaValida('12:60')).toBe(false);
    expect(horaValida('9:00')).toBe(false);
  });
});

describe('horaFimDepoisDeInicio', () => {
  it('exige fim estritamente depois do início', () => {
    expect(horaFimDepoisDeInicio('08:00', '09:30')).toBe(true);
    expect(horaFimDepoisDeInicio('08:00', '08:00')).toBe(false);
    expect(horaFimDepoisDeInicio('10:00', '09:00')).toBe(false);
  });
});

describe('notaValida', () => {
  it('fica entre 0 e a nota máxima', () => {
    expect(notaValida(0, 10)).toBe(true);
    expect(notaValida(10, 10)).toBe(true);
    expect(notaValida(10.1, 10)).toBe(false);
    expect(notaValida(-1, 10)).toBe(false);
    expect(notaValida(80, 100)).toBe(true);
  });
});

describe('diasNoMes', () => {
  it('trata fevereiro bissexto', () => {
    expect(diasNoMes(2024, 2)).toBe(29);
    expect(diasNoMes(2026, 2)).toBe(28);
    expect(diasNoMes(2100, 2)).toBe(28);
    expect(diasNoMes(2026, 4)).toBe(30);
    expect(diasNoMes(2026, 12)).toBe(31);
  });
});
