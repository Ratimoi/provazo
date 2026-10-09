import { horaFimDepoisDeInicio, horaValida } from './validacao';

export type Horario = {
  /** 0 = domingo … 6 = sábado */
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
};

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** Dois horários no mesmo dia se sobrepõem quando um começa antes de o outro terminar. */
export function horariosSeSobrepoem(a: Horario, b: Horario): boolean {
  if (a.diaSemana !== b.diaSemana) return false;
  return (
    minutos(a.horaInicio) < minutos(b.horaFim) &&
    minutos(b.horaInicio) < minutos(a.horaFim)
  );
}

/**
 * Pares que se sobrepõem entre `novos` (os que estão sendo editados) e
 * `existentes` (os de outras matérias), e também dentro dos próprios `novos`.
 * Devolve os índices, pra quem chama montar a mensagem.
 */
export function encontrarConflitos(
  novos: Horario[],
  existentes: Horario[],
): { novo: number; outro: { origem: 'novo' | 'existente'; indice: number } }[] {
  const conflitos: {
    novo: number;
    outro: { origem: 'novo' | 'existente'; indice: number };
  }[] = [];
  novos.forEach((horario, i) => {
    novos.forEach((outro, j) => {
      if (j > i && horariosSeSobrepoem(horario, outro)) {
        conflitos.push({ novo: i, outro: { origem: 'novo', indice: j } });
      }
    });
    existentes.forEach((outro, j) => {
      if (horariosSeSobrepoem(horario, outro)) {
        conflitos.push({ novo: i, outro: { origem: 'existente', indice: j } });
      }
    });
  });
  return conflitos;
}

/** Mensagem de erro do primeiro problema do horário, ou null se estiver ok. */
export function validarHorario(horario: Horario): string | null {
  if (!horaValida(horario.horaInicio)) {
    return 'Escolha a hora de início da aula.';
  }
  if (!horaValida(horario.horaFim)) {
    return 'Escolha a hora de fim da aula.';
  }
  if (!horaFimDepoisDeInicio(horario.horaInicio, horario.horaFim)) {
    return 'A hora de fim precisa ser depois da hora de início.';
  }
  return null;
}

/** Soma minutos a um horário HH:MM (limitado a 23:59, sem virar o dia). */
export function somarMinutos(hora: string, minutosASomar: number): string {
  const total = Math.min(minutos(hora) + minutosASomar, 23 * 60 + 59);
  const h = String(Math.floor(total / 60)).padStart(2, '0');
  const m = String(total % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Diferença em minutos entre dois horários HH:MM (fim - início). */
export function duracaoEmMinutos(inicio: string, fim: string): number {
  return minutos(fim) - minutos(inicio);
}
