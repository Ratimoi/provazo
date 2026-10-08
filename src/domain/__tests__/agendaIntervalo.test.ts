import { describe, expect, it } from 'vitest';

import { intervaloDoCompromisso } from '../agenda';
import type { Compromisso } from '../timeline';

function compromisso(parcial: Partial<Compromisso>): Compromisso {
  return {
    id: 'x',
    tipo: 'pessoal',
    titulo: 'x',
    corHex: '#000',
    horaInicio: '10:00',
    horaFim: null,
    origem: 'evento_unico',
    origemId: 1,
    ...parcial,
  };
}

describe('intervaloDoCompromisso', () => {
  it('usa a hora de fim quando existe', () => {
    expect(intervaloDoCompromisso(compromisso({ horaFim: '11:30' }))).toEqual({
      inicioMin: 600,
      fimMin: 690,
    });
  });

  it('sem fim, compromisso comum dura 1h e avaliação 20 min', () => {
    expect(intervaloDoCompromisso(compromisso({})).fimMin).toBe(660);
    expect(
      intervaloDoCompromisso(compromisso({ origem: 'avaliacao' })).fimMin,
    ).toBe(620);
  });

  it('garante duração mínima de 15 min', () => {
    expect(intervaloDoCompromisso(compromisso({ horaFim: '10:05' })).fimMin).toBe(615);
  });

  it('00:00 começa no minuto 0', () => {
    expect(intervaloDoCompromisso(compromisso({ horaInicio: '00:00' })).inicioMin).toBe(0);
  });
});
