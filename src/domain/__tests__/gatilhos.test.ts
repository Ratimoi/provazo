import { describe, expect, it } from 'vitest';

import { calcularGatilhos, type AvaliacaoParaLembrete } from '../gatilhos';

function av(parcial: Partial<AvaliacaoParaLembrete> = {}): AvaliacaoParaLembrete {
  return {
    id: 1,
    titulo: 'P1',
    tipo: 'prova',
    data: '2026-10-20',
    hora: '14:00',
    materiaNome: 'Cálculo',
    diasAntesLembrete: 1,
    ...parcial,
  };
}

const agora = new Date(2026, 9, 8, 12, 0);

describe('calcularGatilhos', () => {
  it('agenda o aviso X dias antes no horário escolhido e 1h antes no dia', () => {
    const g = calcularGatilhos([av()], '08:00', agora);
    expect(g).toHaveLength(2);
    expect(g[0].quando).toEqual(new Date(2026, 9, 19, 8, 0));
    expect(g[0].titulo).toBe('Prova amanhã às 14:00');
    expect(g[1].quando).toEqual(new Date(2026, 9, 20, 13, 0));
    expect(g[1].titulo).toBe('Prova daqui a 1 hora');
  });

  it('"no dia" avisa de manhã do próprio dia', () => {
    const g = calcularGatilhos([av({ diasAntesLembrete: 0 })], '08:00', agora);
    expect(g[0].quando).toEqual(new Date(2026, 9, 20, 8, 0));
    expect(g[0].titulo).toBe('Prova hoje às 14:00');
  });

  it('sem aviso não agenda nada', () => {
    expect(calcularGatilhos([av({ diasAntesLembrete: -1 })], '08:00', agora)).toEqual([]);
  });

  it('ignora gatilhos que já passaram', () => {
    const g = calcularGatilhos([av({ data: '2026-10-09' })], '08:00', agora);
    // aviso de 08/10 08:00 já passou; sobra só o de 1h antes
    expect(g).toHaveLength(1);
    expect(g[0].identificador).toBe('avaliacao-1-no-dia');
  });

  it('atravessa virada de mês ao voltar dias', () => {
    const g = calcularGatilhos(
      [av({ data: '2026-11-02', diasAntesLembrete: 7 })],
      '08:00',
      agora,
    );
    expect(g[0].quando).toEqual(new Date(2026, 9, 26, 8, 0));
    expect(g[0].titulo).toBe('Prova em 7 dias às 14:00');
  });

  it('mantém só os gatilhos mais próximos quando passa do limite', () => {
    const muitas = Array.from({ length: 5 }, (_, i) =>
      av({ id: i + 1, data: `2026-10-${20 + i}` }),
    );
    const g = calcularGatilhos(muitas, '08:00', agora, 3);
    expect(g).toHaveLength(3);
    expect(g[0].quando.getTime()).toBeLessThanOrEqual(g[2].quando.getTime());
  });
});
