import { dataPertenceAoSemestre, ocorreNoDia } from './ocorrencia';

export type OcorrenciaRecorrente = {
  id: string;
  eventoRecorrenteId: number;
  tipo: 'aula' | 'aniversario' | 'outro';
  titulo: string;
  corHex: string;
  horaInicio: string;
  horaFim: string | null;
  observacoes: string | null;
  materiaId?: number;
  materiaNome?: string;
  materiaInstituicao?: string | null;
  materiaSemestreId?: number;
};

/** Evento recorrente já carregado do banco (com matéria/semestre e dias da semana). */
export type RecorrenteCarregado = {
  id: number;
  titulo: string;
  tipo: 'aula' | 'aniversario' | 'outro';
  frequencia: 'semanal' | 'mensal' | 'anual';
  dataBase: string;
  corHex: string | null;
  horaInicio: string;
  horaFim: string | null;
  observacoes: string | null;
  materiaId: number | null;
  materiaNome: string | null;
  materiaCorHex: string | null;
  materiaInstituicao: string | null;
  materiaSemestreId: number | null;
  anoValor: number | null;
  semestreNumero: number | null;
  diasSemana: number[];
};

export function chaveExcecao(eventoId: number, data: string): string {
  return `${eventoId}|${data}`;
}

/**
 * Expande os recorrentes pelas datas pedidas, de uma vez: as aulas só caem no
 * semestre da matéria, os demais respeitam a data de início, e as exceções
 * (ocorrências puladas) são descartadas. Sem tocar no banco, pra ser rápido e testável.
 */
export function expandirRecorrentesNasDatas(
  eventos: RecorrenteCarregado[],
  excecoes: Set<string>,
  datas: string[],
): Map<string, OcorrenciaRecorrente[]> {
  const resultado = new Map<string, OcorrenciaRecorrente[]>();

  for (const data of datas) {
    const doDia: OcorrenciaRecorrente[] = [];
    for (const e of eventos) {
      const ehAula = e.tipo === 'aula';
      if (
        ehAula &&
        (e.anoValor == null ||
          e.semestreNumero == null ||
          !dataPertenceAoSemestre(data, e.anoValor, e.semestreNumero))
      ) {
        continue;
      }
      const cai = ocorreNoDia(
        {
          frequencia: e.frequencia,
          dataBase: e.dataBase,
          diasSemana: e.diasSemana,
          ehAula,
        },
        data,
      );
      if (!cai || excecoes.has(chaveExcecao(e.id, data))) continue;

      doDia.push({
        id: `recorrente-${e.id}`,
        eventoRecorrenteId: e.id,
        tipo: e.tipo,
        titulo: e.titulo,
        corHex: (ehAula ? e.materiaCorHex : e.corHex) ?? '#6B2545',
        horaInicio: e.horaInicio,
        horaFim: e.horaFim,
        observacoes: e.observacoes,
        materiaId: e.materiaId ?? undefined,
        materiaNome: e.materiaNome ?? undefined,
        materiaInstituicao: e.materiaInstituicao,
        materiaSemestreId: e.materiaSemestreId ?? undefined,
      });
    }
    resultado.set(data, doDia);
  }
  return resultado;
}
