import { listAvaliacoesPorData } from './avaliacoes';
import { CORES_TIPO } from './cores';
import { listEventosUnicosPorData } from './eventosUnicos';

export type TipoCompromisso = 'aula' | 'prova' | 'trabalho' | 'pessoal';

export type Compromisso = {
  id: string;
  tipo: TipoCompromisso;
  titulo: string;
  subtitulo?: string;
  corHex: string;
  horaInicio: string;
  horaFim: string | null;
  origem: 'avaliacao' | 'evento_unico';
  origemId: number;
  materiaId?: number;
};

export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Junta avaliações + eventos únicos de um dia (seção 3 do plano, sem a
 * expansão de eventos recorrentes ainda — Fase 3), ordenados por horário.
 */
export function listCompromissosDoDia(data: string): Compromisso[] {
  const avaliacoes = listAvaliacoesPorData(data);
  const eventos = listEventosUnicosPorData(data);

  const compromissos: Compromisso[] = [
    ...avaliacoes.map((av) => ({
      id: `avaliacao-${av.id}`,
      tipo: av.tipo as TipoCompromisso,
      titulo: av.titulo,
      subtitulo: av.materiaNome,
      corHex: CORES_TIPO[av.tipo],
      horaInicio: av.hora,
      horaFim: null,
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
      origem: 'evento_unico' as const,
      origemId: ev.id,
    })),
  ];

  return compromissos.sort(
    (a, b) => minutosDoDia(a.horaInicio) - minutosDoDia(b.horaInicio),
  );
}
