export type AvaliacaoParaLembrete = {
  id: number;
  titulo: string;
  tipo: 'prova' | 'trabalho';
  /** AAAA-MM-DD */
  data: string;
  /** HH:MM */
  hora: string;
  materiaNome: string;
  /** -1 = sem aviso; 0 = só no dia; N = N dias antes. */
  diasAntesLembrete: number;
};

export type Gatilho = {
  identificador: string;
  quando: Date;
  titulo: string;
  corpo: string;
};

/** Limite de notificações agendadas (iOS aceita no máximo 64 pendentes). */
export const LIMITE_GATILHOS = 60;
const ANTECEDENCIA_NO_DIA_MIN = 60;

function montarData(dataIso: string, hora: string): Date {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, h, m, 0, 0);
}

function rotuloPrazo(dias: number): string {
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  return `em ${dias} dias`;
}

/**
 * Converte avaliações em notificações a agendar:
 * - "X dias antes" no horário de aviso escolhido (X = 0 é a manhã do próprio dia);
 * - e sempre um aviso 1h antes da avaliação, no dia.
 * Ignora o que já passou, avaliações sem aviso e mantém só os `limite` mais próximos.
 */
export function calcularGatilhos(
  avaliacoes: AvaliacaoParaLembrete[],
  horaAviso: string,
  agora: Date,
  limite: number = LIMITE_GATILHOS,
): Gatilho[] {
  const gatilhos: Gatilho[] = [];

  for (const av of avaliacoes) {
    if (av.diasAntesLembrete < 0) continue;
    const rotuloTipo = av.tipo === 'prova' ? 'Prova' : 'Trabalho';
    const detalhe = `${av.titulo} · ${av.materiaNome}`;

    const diaAviso = montarData(av.data, horaAviso);
    diaAviso.setDate(diaAviso.getDate() - av.diasAntesLembrete);
    gatilhos.push({
      identificador: `avaliacao-${av.id}-antes`,
      quando: diaAviso,
      titulo: `${rotuloTipo} ${rotuloPrazo(av.diasAntesLembrete)} às ${av.hora}`,
      corpo: detalhe,
    });

    const noDia = montarData(av.data, av.hora);
    noDia.setMinutes(noDia.getMinutes() - ANTECEDENCIA_NO_DIA_MIN);
    gatilhos.push({
      identificador: `avaliacao-${av.id}-no-dia`,
      quando: noDia,
      titulo: `${rotuloTipo} daqui a 1 hora`,
      corpo: detalhe,
    });
  }

  return gatilhos
    .filter((g) => g.quando.getTime() > agora.getTime())
    .sort((a, b) => a.quando.getTime() - b.quando.getTime())
    .slice(0, limite);
}
