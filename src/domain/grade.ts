import { atribuirColunas } from './agenda';
import type { Horario } from './horarios';

export type AulaNaGrade<T> = Horario & { dados: T };

export type BlocoDaGrade<T> = {
  dados: T;
  /** Posição do dia dentro de `dias`. */
  coluna: number;
  top: number;
  altura: number;
  /** Subdivisão quando duas aulas se sobrepõem no mesmo dia. */
  subColuna: number;
  totalSubColunas: number;
};

export type GradeSemanal<T> = {
  /** Dias exibidos, de segunda pra frente; sábado e domingo só se tiverem aula. */
  dias: number[];
  inicioHora: number;
  fimHora: number;
  alturaTotal: number;
  blocos: BlocoDaGrade<T>[];
};

const DIAS_UTEIS = [1, 2, 3, 4, 5];
const FAIXA_PADRAO = { inicio: 8, fim: 20 };

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Calcula onde cada aula desenha na grade semanal. A faixa de horas começa em
 * 08–20 e só se estende se houver aula fora dela.
 */
export function posicionarBlocosSemana<T>(
  aulas: AulaNaGrade<T>[],
  pxPorHora: number,
): GradeSemanal<T> {
  const dias = [...DIAS_UTEIS];
  if (aulas.some((a) => a.diaSemana === 6)) dias.push(6);
  if (aulas.some((a) => a.diaSemana === 0)) dias.push(0);

  let inicioHora = FAIXA_PADRAO.inicio;
  let fimHora = FAIXA_PADRAO.fim;
  for (const aula of aulas) {
    inicioHora = Math.min(inicioHora, Math.floor(minutos(aula.horaInicio) / 60));
    fimHora = Math.max(fimHora, Math.ceil(minutos(aula.horaFim) / 60));
  }
  inicioHora = Math.max(0, inicioHora);
  fimHora = Math.min(24, fimHora);

  const blocos: BlocoDaGrade<T>[] = [];
  dias.forEach((dia, coluna) => {
    const doDia = aulas
      .map((aula, indice) => ({ aula, indice }))
      .filter(({ aula }) => aula.diaSemana === dia);
    const posicoes = atribuirColunas(
      doDia.map(({ aula, indice }) => ({
        id: String(indice),
        inicioMin: minutos(aula.horaInicio),
        fimMin: minutos(aula.horaFim),
      })),
    );
    for (const { aula, indice } of doDia) {
      const posicao = posicoes.get(String(indice)) ?? { coluna: 0, totalColunas: 1 };
      blocos.push({
        dados: aula.dados,
        coluna,
        top: ((minutos(aula.horaInicio) - inicioHora * 60) / 60) * pxPorHora,
        altura: ((minutos(aula.horaFim) - minutos(aula.horaInicio)) / 60) * pxPorHora,
        subColuna: posicao.coluna,
        totalSubColunas: posicao.totalColunas,
      });
    }
  });

  return {
    dias,
    inicioHora,
    fimHora,
    alturaTotal: (fimHora - inicioHora) * pxPorHora,
    blocos,
  };
}

/** Converte a posição de um toque (px, a partir do topo da grade) em hora cheia. */
export function horaDoToque(
  yPx: number,
  inicioHora: number,
  pxPorHora: number,
): string {
  const hora = Math.max(0, Math.min(23, inicioHora + Math.floor(yPx / pxPorHora)));
  return `${String(hora).padStart(2, '0')}:00`;
}
