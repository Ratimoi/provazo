import { describe, expect, it } from 'vitest';

import { dataPertenceAoSemestre, ocorreNoDia } from '../ocorrencia';

const base = { diasSemana: [] as number[], ehAula: false };

describe('ocorreNoDia', () => {
  it('semanal cai só nos dias escolhidos', () => {
    const regra = { ...base, frequencia: 'semanal' as const, dataBase: '2026-01-01', diasSemana: [3] };
    expect(ocorreNoDia(regra, '2026-10-07')).toBe(true); // quarta
    expect(ocorreNoDia(regra, '2026-10-08')).toBe(false); // quinta
  });

  it('evento não aparece antes da data base', () => {
    const regra = { ...base, frequencia: 'semanal' as const, dataBase: '2026-10-10', diasSemana: [3] };
    expect(ocorreNoDia(regra, '2026-10-07')).toBe(false);
    expect(ocorreNoDia(regra, '2026-10-14')).toBe(true);
  });

  it('aula ignora a data base (quem delimita é o semestre)', () => {
    const regra = { ...base, frequencia: 'semanal' as const, dataBase: '2026-10-10', diasSemana: [3], ehAula: true };
    expect(ocorreNoDia(regra, '2026-03-04')).toBe(true);
  });

  it('mensal no dia 31 cai no último dia dos meses curtos', () => {
    const regra = { ...base, frequencia: 'mensal' as const, dataBase: '2026-01-31' };
    expect(ocorreNoDia(regra, '2026-02-28')).toBe(true);
    expect(ocorreNoDia(regra, '2026-02-27')).toBe(false);
    expect(ocorreNoDia(regra, '2026-04-30')).toBe(true);
    expect(ocorreNoDia(regra, '2026-05-31')).toBe(true);
    expect(ocorreNoDia(regra, '2026-05-30')).toBe(false);
  });

  it('anual em 29/02 cai em 28/02 nos anos não bissextos', () => {
    const regra = { ...base, frequencia: 'anual' as const, dataBase: '2024-02-29' };
    expect(ocorreNoDia(regra, '2025-02-28')).toBe(true);
    expect(ocorreNoDia(regra, '2028-02-29')).toBe(true);
    expect(ocorreNoDia(regra, '2028-02-28')).toBe(false);
    expect(ocorreNoDia(regra, '2025-03-01')).toBe(false);
  });

  it('anual não aparece antes do ano de origem', () => {
    const regra = { ...base, frequencia: 'anual' as const, dataBase: '2026-05-10' };
    expect(ocorreNoDia(regra, '2020-05-10')).toBe(false);
    expect(ocorreNoDia(regra, '2027-05-10')).toBe(true);
  });
});

describe('dataPertenceAoSemestre', () => {
  it('jan–jun é o 1º semestre e jul–dez o 2º', () => {
    expect(dataPertenceAoSemestre('2026-06-30', 2026, 1)).toBe(true);
    expect(dataPertenceAoSemestre('2026-07-01', 2026, 1)).toBe(false);
    expect(dataPertenceAoSemestre('2026-07-01', 2026, 2)).toBe(true);
  });

  it('rejeita outro ano', () => {
    expect(dataPertenceAoSemestre('2025-03-04', 2026, 1)).toBe(false);
  });
});
