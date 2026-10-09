import { differenceInCalendarDays, endOfWeek, format, parseISO } from 'date-fns';

export type ComPrazo = {
  /** AAAA-MM-DD */
  data: string;
  /** HH:MM */
  hora: string;
  nota: number | null;
};

export type GruposPorPrazo<T extends ComPrazo> = {
  estaSemana: T[];
  proximas: T[];
  /** Já passaram, mas a nota ainda não foi lançada. */
  aguardandoNota: T[];
  /** Já passaram e têm nota. */
  anteriores: T[];
};

function porDataHora<T extends ComPrazo>(a: T, b: T): number {
  return `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`);
}

/**
 * Separa as avaliações pela urgência: o que cai até o domingo desta semana,
 * o que vem depois, o que já passou sem nota e o que já passou com nota.
 * Os grupos futuros ficam do mais próximo ao mais distante; os passados, do
 * mais recente ao mais antigo.
 */
export function agruparPorPrazo<T extends ComPrazo>(
  avaliacoes: T[],
  hoje: string,
): GruposPorPrazo<T> {
  const domingo = format(
    endOfWeek(parseISO(hoje), { weekStartsOn: 1 }),
    'yyyy-MM-dd',
  );
  const grupos: GruposPorPrazo<T> = {
    estaSemana: [],
    proximas: [],
    aguardandoNota: [],
    anteriores: [],
  };

  for (const av of avaliacoes) {
    if (av.data >= hoje) {
      (av.data <= domingo ? grupos.estaSemana : grupos.proximas).push(av);
    } else {
      (av.nota == null ? grupos.aguardandoNota : grupos.anteriores).push(av);
    }
  }

  grupos.estaSemana.sort(porDataHora);
  grupos.proximas.sort(porDataHora);
  grupos.aguardandoNota.sort((a, b) => porDataHora(b, a));
  grupos.anteriores.sort((a, b) => porDataHora(b, a));
  return grupos;
}

/** Rótulo curto da distância até a data: "hoje", "amanhã", "em 5 dias", "há 2 dias". */
export function rotuloPrazo(data: string, hoje: string): string {
  const dias = differenceInCalendarDays(parseISO(data), parseISO(hoje));
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  if (dias === -1) return 'ontem';
  if (dias < 0) return `há ${-dias} dias`;
  if (dias < 7) return `em ${dias} dias`;
  if (dias < 60) return `em ${Math.floor(dias / 7)} sem.`;
  return `em ${Math.floor(dias / 30)} meses`;
}

/** Primeira avaliação que ainda vai acontecer (hoje ou depois), se houver. */
export function proximaAvaliacao<T extends ComPrazo>(
  grupos: GruposPorPrazo<T>,
): T | null {
  return grupos.estaSemana[0] ?? grupos.proximas[0] ?? null;
}

/** Número grande + unidade pro destaque ("1 dia", "5 dias", "2 sem."); "Hoje" sem unidade. */
export function contagemDoPrazo(
  data: string,
  hoje: string,
): { numero: string; unidade: string } {
  const dias = differenceInCalendarDays(parseISO(data), parseISO(hoje));
  if (dias <= 0) return { numero: 'Hoje', unidade: '' };
  if (dias === 1) return { numero: '1', unidade: 'dia' };
  if (dias < 7) return { numero: String(dias), unidade: 'dias' };
  if (dias < 60) return { numero: String(Math.floor(dias / 7)), unidade: 'sem.' };
  return { numero: String(Math.floor(dias / 30)), unidade: 'meses' };
}
