import { describe, expect, it } from 'vitest';

import { agruparPorPrazo, contagemDoPrazo, proximaAvaliacao, rotuloPrazo } from '../prazos';

function av(data: string, nota: number | null = null, hora = '10:00') {
  return { data, hora, nota };
}

// 2026-10-08 é uma quinta-feira; a semana (segunda a domingo) vai até 2026-10-11.
const hoje = '2026-10-08';

describe('agruparPorPrazo', () => {
  it('separa por semana, próximas, aguardando nota e anteriores', () => {
    const g = agruparPorPrazo(
      [
        av('2026-10-22'),
        av('2026-10-09'),
        av('2026-10-11'),
        av('2026-10-12'),
        av('2026-10-01'),
        av('2026-09-20', 8),
        av('2026-09-25', 7),
      ],
      hoje,
    );
    expect(g.estaSemana.map((a) => a.data)).toEqual(['2026-10-09', '2026-10-11']);
    expect(g.proximas.map((a) => a.data)).toEqual(['2026-10-12', '2026-10-22']);
    expect(g.aguardandoNota.map((a) => a.data)).toEqual(['2026-10-01']);
    expect(g.anteriores.map((a) => a.data)).toEqual(['2026-09-25', '2026-09-20']);
  });

  it('o que cai hoje conta como desta semana, mesmo já com nota', () => {
    const g = agruparPorPrazo([av(hoje, 9)], hoje);
    expect(g.estaSemana).toHaveLength(1);
  });

  it('desempata pela hora', () => {
    const g = agruparPorPrazo(
      [av('2026-10-09', null, '14:00'), av('2026-10-09', null, '08:00')],
      hoje,
    );
    expect(g.estaSemana.map((a) => a.hora)).toEqual(['08:00', '14:00']);
  });

  it('numa segunda-feira a semana ainda tem 7 dias', () => {
    const g = agruparPorPrazo([av('2026-10-18'), av('2026-10-19')], '2026-10-12');
    expect(g.estaSemana.map((a) => a.data)).toEqual(['2026-10-18']);
    expect(g.proximas.map((a) => a.data)).toEqual(['2026-10-19']);
  });
});

describe('proximaAvaliacao', () => {
  it('pega a primeira que ainda vai acontecer', () => {
    const g = agruparPorPrazo([av('2026-10-22'), av('2026-10-09')], hoje);
    expect(proximaAvaliacao(g)?.data).toBe('2026-10-09');
  });
  it('sem nenhuma futura, não há próxima', () => {
    expect(proximaAvaliacao(agruparPorPrazo([av('2026-09-01', 7)], hoje))).toBeNull();
  });
});

describe('rotuloPrazo', () => {
  it('cobre hoje, amanhã, dias, semanas e passado', () => {
    expect(rotuloPrazo('2026-10-08', hoje)).toBe('hoje');
    expect(rotuloPrazo('2026-10-09', hoje)).toBe('amanhã');
    expect(rotuloPrazo('2026-10-13', hoje)).toBe('em 5 dias');
    expect(rotuloPrazo('2026-10-15', hoje)).toBe('em 1 sem.');
    expect(rotuloPrazo('2026-10-22', hoje)).toBe('em 2 sem.');
    expect(rotuloPrazo('2027-01-08', hoje)).toBe('em 3 meses');
    expect(rotuloPrazo('2026-10-07', hoje)).toBe('ontem');
    expect(rotuloPrazo('2026-10-01', hoje)).toBe('há 7 dias');
  });
});

describe('contagemDoPrazo', () => {
  it('monta número e unidade do destaque', () => {
    expect(contagemDoPrazo('2026-10-08', hoje)).toEqual({ numero: 'Hoje', unidade: '' });
    expect(contagemDoPrazo('2026-10-09', hoje)).toEqual({ numero: '1', unidade: 'dia' });
    expect(contagemDoPrazo('2026-10-13', hoje)).toEqual({ numero: '5', unidade: 'dias' });
    expect(contagemDoPrazo('2026-10-22', hoje)).toEqual({ numero: '2', unidade: 'sem.' });
  });
});
