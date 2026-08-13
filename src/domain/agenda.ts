import type { Compromisso } from './timeline';

export const PX_POR_HORA = 64;
export const ALTURA_TOTAL = 24 * PX_POR_HORA;
const DURACAO_PADRAO_MIN = 60;
// Prova/trabalho não "ocupa" um horário como uma aula — é um prazo, não um
// intervalo — então ganha uma duração padrão bem menor, só o suficiente pra
// virar um marcador compacto em vez de um bloco do tamanho de uma aula.
const DURACAO_AVALIACAO_MIN = 20;
const DURACAO_MINIMA_MIN = 15;

function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function intervaloDoCompromisso(compromisso: Compromisso): {
  inicioMin: number;
  fimMin: number;
} {
  const inicioMin = minutosDoDia(compromisso.horaInicio);
  const duracaoPadrao =
    compromisso.origem === 'avaliacao'
      ? DURACAO_AVALIACAO_MIN
      : DURACAO_PADRAO_MIN;
  const fimBruto = compromisso.horaFim
    ? minutosDoDia(compromisso.horaFim)
    : inicioMin + duracaoPadrao;
  const fimMin = inicioMin + Math.max(fimBruto - inicioMin, DURACAO_MINIMA_MIN);
  return { inicioMin, fimMin };
}

export function minutosParaPixels(min: number): number {
  return (min / 60) * PX_POR_HORA;
}

export type ItemComColuna = { coluna: number; totalColunas: number };

/**
 * Agrupa itens que se sobrepõem no tempo (transitivamente, via sweep) e
 * atribui a cada um uma coluna dentro do grupo, pra dividirem a largura
 * disponível lado a lado em vez de ficar um por cima do outro.
 */
export function atribuirColunas(
  itens: { id: string; inicioMin: number; fimMin: number }[],
): Map<string, ItemComColuna> {
  const ordenados = [...itens].sort((a, b) => a.inicioMin - b.inicioMin);
  const resultado = new Map<string, ItemComColuna>();

  let grupo: typeof ordenados = [];
  let grupoFimMax = -Infinity;

  function fecharGrupo() {
    if (grupo.length === 0) return;
    const finsPorColuna: number[] = [];
    const atribuicoes: { id: string; coluna: number }[] = [];
    for (const item of grupo) {
      let coluna = finsPorColuna.findIndex((fim) => fim <= item.inicioMin);
      if (coluna === -1) {
        coluna = finsPorColuna.length;
        finsPorColuna.push(item.fimMin);
      } else {
        finsPorColuna[coluna] = item.fimMin;
      }
      atribuicoes.push({ id: item.id, coluna });
    }
    const totalColunas = finsPorColuna.length;
    for (const { id, coluna } of atribuicoes) {
      resultado.set(id, { coluna, totalColunas });
    }
    grupo = [];
    grupoFimMax = -Infinity;
  }

  for (const item of ordenados) {
    if (grupo.length > 0 && item.inicioMin >= grupoFimMax) {
      fecharGrupo();
    }
    grupo.push(item);
    grupoFimMax = Math.max(grupoFimMax, item.fimMin);
  }
  fecharGrupo();

  return resultado;
}

export function minutosAgora(): number {
  const agora = new Date();
  return agora.getHours() * 60 + agora.getMinutes();
}
