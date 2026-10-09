import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type FrequenciaRotina = 'semanal' | 'mensal' | 'anual';

export type PresetRotina =
  | 'todo-dia'
  | 'dias-uteis'
  | 'fins-de-semana'
  | 'dias'
  | 'mensal'
  | 'anual';

export const PRESETS_ROTINA: { valor: PresetRotina; rotulo: string }[] = [
  { valor: 'todo-dia', rotulo: 'Todo dia' },
  { valor: 'dias-uteis', rotulo: 'Dias úteis' },
  { valor: 'fins-de-semana', rotulo: 'Fins de semana' },
  { valor: 'dias', rotulo: 'Dias escolhidos' },
  { valor: 'mensal', rotulo: 'Todo mês' },
  { valor: 'anual', rotulo: 'Todo ano' },
];

const TODOS = [0, 1, 2, 3, 4, 5, 6];
const UTEIS = [1, 2, 3, 4, 5];
const FIM_DE_SEMANA = [0, 6];

const ABREVIACAO: Record<number, string> = {
  0: 'dom',
  1: 'seg',
  2: 'ter',
  3: 'qua',
  4: 'qui',
  5: 'sex',
  6: 'sáb',
};
const ORDEM = [1, 2, 3, 4, 5, 6, 0];

function mesmoConjunto(a: number[], b: number[]): boolean {
  return a.length === b.length && b.every((d) => a.includes(d));
}

/** Converte o atalho escolhido em frequência + dias da semana (sem mudar o esquema do banco). */
export function aplicarPreset(
  preset: PresetRotina,
  diasEscolhidos: number[],
): { frequencia: FrequenciaRotina; diasSemana: number[] } {
  switch (preset) {
    case 'todo-dia':
      return { frequencia: 'semanal', diasSemana: [...TODOS] };
    case 'dias-uteis':
      return { frequencia: 'semanal', diasSemana: [...UTEIS] };
    case 'fins-de-semana':
      return { frequencia: 'semanal', diasSemana: [...FIM_DE_SEMANA] };
    case 'dias':
      return { frequencia: 'semanal', diasSemana: [...diasEscolhidos] };
    case 'mensal':
      return { frequencia: 'mensal', diasSemana: [] };
    case 'anual':
      return { frequencia: 'anual', diasSemana: [] };
  }
}

/** Faz o caminho inverso, pra mostrar o atalho certo ao editar uma rotina salva. */
export function presetDe(
  frequencia: FrequenciaRotina,
  diasSemana: number[],
): PresetRotina {
  if (frequencia === 'mensal') return 'mensal';
  if (frequencia === 'anual') return 'anual';
  if (mesmoConjunto(diasSemana, TODOS)) return 'todo-dia';
  if (mesmoConjunto(diasSemana, UTEIS)) return 'dias-uteis';
  if (mesmoConjunto(diasSemana, FIM_DE_SEMANA)) return 'fins-de-semana';
  return 'dias';
}

function listaDeDias(dias: number[]): string {
  const nomes = ORDEM.filter((d) => dias.includes(d)).map((d) => ABREVIACAO[d]);
  if (nomes.length <= 1) return nomes.join('');
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

/** Frase-resumo da rotina, ex.: "Toda seg, qua e qui · 18:00–19:00". */
export function descreverRotina(dados: {
  preset: PresetRotina;
  diasSemana: number[];
  dataBase: string;
  horaInicio: string;
  horaFim: string;
}): string {
  let quando: string;
  switch (dados.preset) {
    case 'todo-dia':
      quando = 'Todo dia';
      break;
    case 'dias-uteis':
      quando = 'Dias úteis (seg a sex)';
      break;
    case 'fins-de-semana':
      quando = 'Sábado e domingo';
      break;
    case 'dias':
      quando =
        dados.diasSemana.length === 0
          ? 'Escolha os dias da semana'
          : `Toda ${listaDeDias(dados.diasSemana)}`;
      break;
    case 'mensal':
      quando = `Todo dia ${Number(dados.dataBase.slice(8, 10))} do mês`;
      break;
    case 'anual':
      quando = `Todo ano em ${format(parseISO(dados.dataBase), "d 'de' MMMM", { locale: ptBR })}`;
      break;
  }
  const hora = dados.horaInicio
    ? ` · ${dados.horaInicio}${dados.horaFim ? `–${dados.horaFim}` : ''}`
    : '';
  return `${quando}${hora}`;
}
