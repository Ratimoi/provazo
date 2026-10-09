import { listAvaliacoesPorPeriodo } from './avaliacoes';
import { CORES_TIPO } from './cores';
import { listEventosUnicosPorPeriodo } from './eventosUnicos';
import { datasDoPeriodo } from './periodo';
import { expandirRecorrentesNoPeriodo } from './recorrencia';

export type TipoCompromisso =
  | 'aula'
  | 'prova'
  | 'trabalho'
  | 'pessoal'
  | 'aniversario'
  | 'outro';

export type Compromisso = {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  subtitulo?: string;
  corHex: string;
  horaInicio: string;
  horaFim: string | null;
  observacoes?: string | null;
  instituicao?: string | null;
  origem: 'avaliacao' | 'evento_unico' | 'recorrente';
  origemId: number;
  materiaId?: number;
  /** Semestre da matéria (avaliações e aulas), pra abrir o detalhe sem consultar o banco. */
  semestreId?: number;
};

export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Junta avaliações, eventos únicos e a expansão dos eventos recorrentes
 * (seções 3 e 5 do plano) de cada dia entre duas datas, ordenados por horário.
 * Cada fonte é lida uma vez pro período todo.
 */
export function listCompromissosDoPeriodo(
  inicio: string,
  fim: string,
): Map<string, Compromisso[]> {
  const porDia = new Map<string, Compromisso[]>(
    datasDoPeriodo(inicio, fim).map((d) => [d, []]),
  );

  for (const av of listAvaliacoesPorPeriodo(inicio, fim)) {
    porDia.get(av.data)?.push({
      id: `avaliacao-${av.id}`,
      tipo: av.tipo as TipoCompromisso,
      titulo: av.titulo,
      subtitulo: av.materiaNome,
      corHex: CORES_TIPO[av.tipo],
      horaInicio: av.hora,
      horaFim: null,
      instituicao: av.materiaInstituicao,
      origem: 'avaliacao',
      origemId: av.id,
      materiaId: av.materiaId,
      semestreId: av.materiaSemestreId,
    });
  }

  for (const ev of listEventosUnicosPorPeriodo(inicio, fim)) {
    porDia.get(ev.data)?.push({
      id: `evento-${ev.id}`,
      tipo: 'pessoal',
      titulo: ev.titulo,
      corHex: ev.corHex,
      horaInicio: ev.horaInicio,
      horaFim: ev.horaFim,
      observacoes: ev.observacoes,
      origem: 'evento_unico',
      origemId: ev.id,
    });
  }

  for (const [data, ocorrencias] of expandirRecorrentesNoPeriodo(inicio, fim)) {
    for (const oc of ocorrencias) {
      porDia.get(data)?.push({
        id: oc.id,
        tipo: oc.tipo as TipoCompromisso,
        titulo: oc.titulo,
        subtitulo: oc.materiaNome,
        corHex: oc.corHex,
        horaInicio: oc.horaInicio,
        horaFim: oc.horaFim,
        observacoes: oc.observacoes,
        instituicao: oc.materiaInstituicao,
        origem: 'recorrente',
        origemId: oc.eventoRecorrenteId,
        materiaId: oc.materiaId,
        semestreId: oc.materiaSemestreId,
      });
    }
  }

  for (const lista of porDia.values()) {
    lista.sort((a, b) => minutosDoDia(a.horaInicio) - minutosDoDia(b.horaInicio));
  }
  return porDia;
}

export function listCompromissosDoDia(data: string): Compromisso[] {
  return listCompromissosDoPeriodo(data, data).get(data) ?? [];
}
