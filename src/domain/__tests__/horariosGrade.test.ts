import { describe, expect, it } from 'vitest';

import { horaDoToque, posicionarBlocosSemana } from '../grade';
import {
  duracaoEmMinutos,
  encontrarConflitos,
  horariosSeSobrepoem,
  somarMinutos,
  validarHorario,
} from '../horarios';

const qua = (inicio: string, fim: string) => ({ diaSemana: 3, horaInicio: inicio, horaFim: fim });

describe('horariosSeSobrepoem', () => {
  it('detecta sobreposição só no mesmo dia', () => {
    expect(horariosSeSobrepoem(qua('08:00', '10:00'), qua('09:00', '11:00'))).toBe(true);
    expect(horariosSeSobrepoem(qua('08:00', '10:00'), qua('10:00', '12:00'))).toBe(false);
    expect(
      horariosSeSobrepoem(qua('08:00', '10:00'), { ...qua('08:00', '10:00'), diaSemana: 4 }),
    ).toBe(false);
  });
});

describe('encontrarConflitos', () => {
  it('compara novos entre si e com os existentes', () => {
    const r = encontrarConflitos(
      [qua('08:00', '10:00'), qua('09:30', '11:00')],
      [qua('10:30', '12:00')],
    );
    expect(r).toEqual([
      { novo: 0, outro: { origem: 'novo', indice: 1 } },
      { novo: 1, outro: { origem: 'existente', indice: 0 } },
    ]);
  });
  it('sem sobreposição não devolve nada', () => {
    expect(encontrarConflitos([qua('08:00', '10:00')], [qua('10:00', '12:00')])).toEqual([]);
  });
});

describe('validarHorario', () => {
  it('aponta o primeiro problema', () => {
    expect(validarHorario(qua('', '10:00'))).toContain('início');
    expect(validarHorario(qua('08:00', ''))).toContain('fim');
    expect(validarHorario(qua('10:00', '09:00'))).toContain('depois');
    expect(validarHorario(qua('08:00', '10:00'))).toBeNull();
  });
});

describe('somarMinutos e duracaoEmMinutos', () => {
  it('soma sem virar o dia', () => {
    expect(somarMinutos('08:00', 100)).toBe('09:40');
    expect(somarMinutos('23:00', 120)).toBe('23:59');
    expect(duracaoEmMinutos('08:00', '09:40')).toBe(100);
  });
});

describe('posicionarBlocosSemana', () => {
  it('usa a faixa 08–20 e só seg–sex quando cabe', () => {
    const g = posicionarBlocosSemana([{ ...qua('08:00', '10:00'), dados: 'a' }], 40);
    expect(g.dias).toEqual([1, 2, 3, 4, 5]);
    expect([g.inicioHora, g.fimHora]).toEqual([8, 20]);
    expect(g.alturaTotal).toBe(480);
    expect(g.blocos[0]).toMatchObject({ coluna: 2, top: 0, altura: 80, totalSubColunas: 1 });
  });

  it('estende a faixa e inclui sábado quando preciso', () => {
    const g = posicionarBlocosSemana(
      [
        { diaSemana: 6, horaInicio: '06:30', horaFim: '08:00', dados: 'a' },
        { diaSemana: 1, horaInicio: '19:00', horaFim: '21:30', dados: 'b' },
      ],
      40,
    );
    expect(g.dias).toEqual([1, 2, 3, 4, 5, 6]);
    expect([g.inicioHora, g.fimHora]).toEqual([6, 22]);
  });

  it('divide a coluna quando duas aulas se sobrepõem', () => {
    const g = posicionarBlocosSemana(
      [
        { ...qua('08:00', '10:00'), dados: 'a' },
        { ...qua('09:00', '11:00'), dados: 'b' },
      ],
      40,
    );
    expect(g.blocos.map((b) => [b.subColuna, b.totalSubColunas])).toEqual([
      [0, 2],
      [1, 2],
    ]);
  });
});

describe('horaDoToque', () => {
  it('converte a posição do toque em hora cheia', () => {
    expect(horaDoToque(0, 8, 40)).toBe('08:00');
    expect(horaDoToque(85, 8, 40)).toBe('10:00');
  });
});
