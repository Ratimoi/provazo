export type AnoNumero = { anoValor: number; numero: 1 | 2 };

export function semestreAtualPadrao(hoje = new Date()): AnoNumero {
  return {
    anoValor: hoje.getFullYear(),
    numero: hoje.getMonth() < 6 ? 1 : 2,
  };
}

export function semestreAdjacente(
  atual: AnoNumero,
  direcao: 1 | -1,
): AnoNumero {
  if (direcao === 1) {
    return atual.numero === 1
      ? { anoValor: atual.anoValor, numero: 2 }
      : { anoValor: atual.anoValor + 1, numero: 1 };
  }
  return atual.numero === 2
    ? { anoValor: atual.anoValor, numero: 1 }
    : { anoValor: atual.anoValor - 1, numero: 2 };
}
