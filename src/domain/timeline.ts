import { listAvaliacoesPorData } from './avaliacoes';
import { CORES_TIPO } from './cores';
import { listEventosUnicosPorData } from './eventosUnicos';
import { expandirEventosRecorrentesParaDia } from './recorrencia';

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
};

export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Junta avaliações, eventos únicos e a expansão dos eventos recorrentes
 * (seções 3 e 5 do plano) de um dia, ordenados por horário.
 */
export function listCompromissosDoDia(data: string): Compromisso[] {
  const avaliacoes = listAvaliacoesPorData(data);
  const eventos = listEventosUnicosPorData(data);
  const recorrentes = expandirEventosRecorrentesParaDia(data);

  const compromissos: Compromisso[] = [
    ...avaliacoes.map((av) => ({
      id: `avaliacao-${av.id}`,
      tipo: av.tipo as TipoCompromisso,
      titulo: av.titulo,
      subtitulo: av.materiaNome,
      corHex: CORES_TIPO[av.tipo],
      horaInicio: av.hora,
      horaFim: null,
      instituicao: av.materiaInstituicao,
      origem: 'avaliacao' as const,
      origemId: av.id,
      materiaId: av.materiaId,
    })),
    ...eventos.map((ev) => ({
      id: `evento-${ev.id}`,
      tipo: 'pessoal' as const,
      titulo: ev.titulo,
      corHex: ev.corHex,
      horaInicio: ev.horaInicio,
      horaFim: ev.horaFim,
      observacoes: ev.observacoes,
      origem: 'evento_unico' as const,
      origemId: ev.id,
    })),
    ...recorrentes.map((oc) => ({
      id: oc.id,
      tipo: oc.tipo as TipoCompromisso,
      titulo: oc.titulo,
      subtitulo: oc.materiaNome,
      corHex: oc.corHex,
      horaInicio: oc.horaInicio,
      horaFim: oc.horaFim,
      observacoes: oc.observacoes,
      instituicao: oc.materiaInstituicao,
      origem: 'recorrente' as const,
      origemId: oc.eventoRecorrenteId,
      materiaId: oc.materiaId,
    })),
  ];

  return compromissos.sort(
    (a, b) => minutosDoDia(a.horaInicio) - minutosDoDia(b.horaInicio),
  );
}
