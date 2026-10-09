import { describe, expect, it } from 'vitest';

import { faixaDeHoras, lacunasLivres, rotuloDuracao } from '../agenda';
import {
  chaveExcecao,
  expandirRecorrentesNasDatas,
  type RecorrenteCarregado,
} from '../expansao';
import { datasDoPeriodo, segundaDaSemana, segundasDoPeriodo } from '../periodo';
import { aplicarPreset, descreverRotina, presetDe } from '../rotinas';
import type { Compromisso } from '../timeline';

function comp(
  horaInicio: string,
  horaFim: string | null,
  parcial: Partial<Compromisso> = {},
): Compromisso {
  return {
    id: horaInicio,
    tipo: 'pessoal',
    titulo: 'x',
    corHex: '#000',
    horaInicio,
    horaFim,
    origem: 'evento_unico',
    origemId: 1,
    ...parcial,
  };
}

function rec(parcial: Partial<RecorrenteCarregado>): RecorrenteCarregado {
  return {
    id: 1,
    titulo: 'Academia',
    tipo: 'outro',
    frequencia: 'semanal',
    dataBase: '2026-10-01',
    corHex: '#8B5CF6',
    horaInicio: '18:00',
    horaFim: '19:00',
    observacoes: null,
    materiaId: null,
    materiaNome: null,
    materiaCorHex: null,
    materiaInstituicao: null,
    materiaSemestreId: null,
    anoValor: null,
    semestreNumero: null,
    diasSemana: [1, 3],
    ...parcial,
  };
}

describe('periodo', () => {
  it('lista datas inclusive e acha as segundas-feiras', () => {
    expect(datasDoPeriodo('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);
    expect(segundaDaSemana('2026-10-11')).toBe('2026-10-05');
    expect(segundasDoPeriodo('2026-10-08', '2026-10-20')).toEqual([
      '2026-10-05',
      '2026-10-12',
      '2026-10-19',
    ]);
  });
});

describe('expandirRecorrentesNasDatas', () => {
  const datas = datasDoPeriodo('2026-10-05', '2026-10-11');

  it('semanal cai nos dias escolhidos, numa única passada', () => {
    const r = expandirRecorrentesNasDatas([rec({})], new Set(), datas);
    const dias = [...r.entries()].filter(([, o]) => o.length > 0).map(([d]) => d);
    expect(dias).toEqual(['2026-10-05', '2026-10-07']);
  });

  it('ignora ocorrências puladas', () => {
    const r = expandirRecorrentesNasDatas(
      [rec({})],
      new Set([chaveExcecao(1, '2026-10-05')]),
      datas,
    );
    expect(r.get('2026-10-05')).toEqual([]);
    expect(r.get('2026-10-07')).toHaveLength(1);
  });

  it('aula só aparece dentro do semestre da matéria', () => {
    const aula = rec({
      tipo: 'aula',
      corHex: null,
      materiaId: 7,
      materiaNome: 'Cálculo',
      materiaCorHex: '#3B82F6',
      materiaSemestreId: 3,
      anoValor: 2026,
      semestreNumero: 2,
      diasSemana: [3],
    });
    const r = expandirRecorrentesNasDatas([aula], new Set(), ['2026-10-07', '2026-04-08']);
    expect(r.get('2026-10-07')?.[0]).toMatchObject({
      corHex: '#3B82F6',
      materiaSemestreId: 3,
    });
    expect(r.get('2026-04-08')).toEqual([]);
  });
});

describe('rotinas', () => {
  it('atalhos viram frequência e dias, e voltam ao mesmo atalho', () => {
    expect(aplicarPreset('todo-dia', [])).toEqual({
      frequencia: 'semanal',
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
    });
    expect(aplicarPreset('dias-uteis', []).diasSemana).toEqual([1, 2, 3, 4, 5]);
    expect(aplicarPreset('fins-de-semana', []).diasSemana).toEqual([0, 6]);
    expect(aplicarPreset('dias', [1, 3])).toEqual({
      frequencia: 'semanal',
      diasSemana: [1, 3],
    });
    expect(presetDe('semanal', [5, 4, 3, 2, 1])).toBe('dias-uteis');
    expect(presetDe('semanal', [0, 1, 2, 3, 4, 5, 6])).toBe('todo-dia');
    expect(presetDe('semanal', [6, 0])).toBe('fins-de-semana');
    expect(presetDe('semanal', [1, 3])).toBe('dias');
    expect(presetDe('mensal', [])).toBe('mensal');
  });

  it('descreve a rotina em português', () => {
    const base = { dataBase: '2026-10-08', horaInicio: '18:00', horaFim: '19:00' };
    expect(descreverRotina({ ...base, preset: 'dias', diasSemana: [4, 1, 3] })).toBe(
      'Toda seg, qua e qui · 18:00–19:00',
    );
    expect(descreverRotina({ ...base, preset: 'dias', diasSemana: [2] })).toBe(
      'Toda ter · 18:00–19:00',
    );
    expect(descreverRotina({ ...base, preset: 'todo-dia', diasSemana: [] })).toBe(
      'Todo dia · 18:00–19:00',
    );
    expect(descreverRotina({ ...base, preset: 'mensal', diasSemana: [] })).toBe(
      'Todo dia 8 do mês · 18:00–19:00',
    );
    expect(descreverRotina({ ...base, preset: 'anual', diasSemana: [] })).toBe(
      'Todo ano em 8 de outubro · 18:00–19:00',
    );
    expect(
      descreverRotina({ ...base, horaFim: '', preset: 'todo-dia', diasSemana: [] }),
    ).toBe('Todo dia · 18:00');
  });
});

describe('faixaDeHoras, lacunasLivres e rotuloDuracao', () => {
  it('faixa padrão 07–23 e estende quando preciso', () => {
    expect(faixaDeHoras([comp('09:00', '10:00')])).toEqual({
      inicioHora: 7,
      fimHora: 23,
    });
    expect(faixaDeHoras([comp('05:30', '06:00'), comp('23:00', '23:59')])).toEqual({
      inicioHora: 5,
      fimHora: 24,
    });
  });

  it('lacunas só entre compromissos e acima do mínimo', () => {
    const lista = [comp('10:00', '12:00'), comp('14:00', '15:00'), comp('15:30', '16:00')];
    expect(lacunasLivres(lista)).toEqual([{ inicioMin: 720, fimMin: 840 }]);
    expect(lacunasLivres([comp('10:00', '11:00')])).toEqual([]);
  });

  it('um compromisso longo cobre os menores dentro dele', () => {
    const lista = [comp('08:00', '14:00'), comp('09:00', '10:00'), comp('16:00', '17:00')];
    expect(lacunasLivres(lista)).toEqual([{ inicioMin: 840, fimMin: 960 }]);
  });

  it('formata a duração', () => {
    expect(rotuloDuracao(120)).toBe('2h');
    expect(rotuloDuracao(90)).toBe('1h30');
    expect(rotuloDuracao(45)).toBe('45 min');
  });
});
