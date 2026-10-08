export const VERSAO_BACKUP = 1;

type Campo = 'int' | 'num' | 'str' | 'bool' | readonly string[] | readonly number[];
type Esquema = Record<string, { tipo: Campo; nulo?: boolean }>;

const ESQUEMAS = {
  ano: {
    id: { tipo: 'int' },
    valor: { tipo: 'int' },
  },
  semestre: {
    id: { tipo: 'int' },
    anoId: { tipo: 'int' },
    numero: { tipo: [1, 2] },
  },
  materia: {
    id: { tipo: 'int' },
    semestreId: { tipo: 'int' },
    nome: { tipo: 'str' },
    corHex: { tipo: 'str' },
    instituicao: { tipo: 'str', nulo: true },
  },
  avaliacao: {
    id: { tipo: 'int' },
    materiaId: { tipo: 'int' },
    tipo: { tipo: ['prova', 'trabalho'] },
    titulo: { tipo: 'str' },
    data: { tipo: 'str' },
    hora: { tipo: 'str' },
    peso: { tipo: 'num' },
    nota: { tipo: 'num', nulo: true },
    notaMaxima: { tipo: 'num' },
    diasAntesLembrete: { tipo: 'int' },
    observacoes: { tipo: 'str', nulo: true },
    createdAt: { tipo: 'str' },
    updatedAt: { tipo: 'str' },
  },
  eventoRecorrente: {
    id: { tipo: 'int' },
    titulo: { tipo: 'str' },
    tipo: { tipo: ['aula', 'aniversario', 'outro'] },
    materiaId: { tipo: 'int', nulo: true },
    corHex: { tipo: 'str', nulo: true },
    frequencia: { tipo: ['semanal', 'mensal', 'anual'] },
    dataBase: { tipo: 'str' },
    horaInicio: { tipo: 'str' },
    horaFim: { tipo: 'str', nulo: true },
    observacoes: { tipo: 'str', nulo: true },
  },
  eventoRecorrenteDiaSemana: {
    id: { tipo: 'int' },
    eventoRecorrenteId: { tipo: 'int' },
    diaSemana: { tipo: [0, 1, 2, 3, 4, 5, 6] },
  },
  eventoRecorrenteExcecao: {
    id: { tipo: 'int' },
    eventoRecorrenteId: { tipo: 'int' },
    data: { tipo: 'str' },
  },
  eventoUnico: {
    id: { tipo: 'int' },
    titulo: { tipo: 'str' },
    data: { tipo: 'str' },
    horaInicio: { tipo: 'str' },
    horaFim: { tipo: 'str', nulo: true },
    corHex: { tipo: 'str' },
    observacoes: { tipo: 'str', nulo: true },
  },
  tarefa: {
    id: { tipo: 'int' },
    titulo: { tipo: 'str' },
    concluida: { tipo: 'bool' },
    observacoes: { tipo: 'str', nulo: true },
    createdAt: { tipo: 'str' },
  },
  preferencia: {
    chave: { tipo: 'str' },
    valor: { tipo: 'str' },
  },
} satisfies Record<string, Esquema>;

export type NomeTabela = keyof typeof ESQUEMAS;
type Linha = Record<string, unknown>;

/** Ordem de inserção: pais antes dos filhos (a de exclusão é a inversa). */
export const ORDEM_TABELAS: NomeTabela[] = [
  'ano',
  'semestre',
  'materia',
  'avaliacao',
  'eventoRecorrente',
  'eventoRecorrenteDiaSemana',
  'eventoRecorrenteExcecao',
  'eventoUnico',
  'tarefa',
  'preferencia',
];

export type Backup = {
  app: 'provazo';
  versao: number;
  appVersion: string;
  exportadoEm: string;
  tabelas: Record<NomeTabela, Linha[]>;
};

export type ResultadoValidacao =
  | { ok: true; backup: Backup }
  | { ok: false; erro: string };

function valorCombina(
  valor: unknown,
  campo: { tipo: Campo; nulo?: boolean },
): boolean {
  if (valor === null) return campo.nulo === true;
  const { tipo } = campo;
  if (Array.isArray(tipo)) return (tipo as readonly unknown[]).includes(valor);
  if (tipo === 'int') return Number.isInteger(valor);
  if (tipo === 'num') return typeof valor === 'number' && Number.isFinite(valor);
  if (tipo === 'str') return typeof valor === 'string';
  return typeof valor === 'boolean';
}

function validarLinha(
  nome: NomeTabela,
  linha: unknown,
  indice: number,
): string | null {
  if (typeof linha !== 'object' || linha === null || Array.isArray(linha)) {
    return `${nome}[${indice}] não é um registro válido.`;
  }
  const registro = linha as Linha;
  const esquema: Esquema = ESQUEMAS[nome];
  for (const [coluna, campo] of Object.entries(esquema)) {
    if (!valorCombina(registro[coluna], campo)) {
      return `${nome}[${indice}].${coluna} tem um valor inválido.`;
    }
  }
  return null;
}

function idsDe(tabela: Linha[]): Set<unknown> {
  return new Set(tabela.map((l) => l.id));
}

/** Confere se cada chave estrangeira aponta para um registro que existe no arquivo. */
function validarReferencias(tabelas: Record<NomeTabela, Linha[]>): string | null {
  const regras: [NomeTabela, string, NomeTabela, boolean][] = [
    ['semestre', 'anoId', 'ano', false],
    ['materia', 'semestreId', 'semestre', false],
    ['avaliacao', 'materiaId', 'materia', false],
    ['eventoRecorrente', 'materiaId', 'materia', true],
    ['eventoRecorrenteDiaSemana', 'eventoRecorrenteId', 'eventoRecorrente', false],
    ['eventoRecorrenteExcecao', 'eventoRecorrenteId', 'eventoRecorrente', false],
  ];
  for (const [filha, coluna, pai, opcional] of regras) {
    const ids = idsDe(tabelas[pai]);
    for (const linha of tabelas[filha]) {
      const valor = linha[coluna];
      if (valor === null && opcional) continue;
      if (!ids.has(valor)) {
        return `${filha} aponta para ${pai} #${String(valor)}, que não existe no arquivo.`;
      }
    }
  }
  return null;
}

/** Valida a estrutura de um arquivo de backup antes de tocar nos dados. */
export function validarBackup(entrada: unknown): ResultadoValidacao {
  if (typeof entrada !== 'object' || entrada === null) {
    return { ok: false, erro: 'O arquivo não parece um backup do Provazo.' };
  }
  const cru = entrada as Record<string, unknown>;
  if (cru.app !== 'provazo') {
    return { ok: false, erro: 'O arquivo não parece um backup do Provazo.' };
  }
  if (typeof cru.versao !== 'number' || cru.versao > VERSAO_BACKUP) {
    return {
      ok: false,
      erro: 'Esse backup é de uma versão mais nova do app. Atualize o Provazo e tente de novo.',
    };
  }
  const tabelasCruas = cru.tabelas;
  if (typeof tabelasCruas !== 'object' || tabelasCruas === null) {
    return { ok: false, erro: 'O backup está incompleto (sem tabelas).' };
  }

  const tabelas = {} as Record<NomeTabela, Linha[]>;
  for (const nome of ORDEM_TABELAS) {
    const linhas = (tabelasCruas as Record<string, unknown>)[nome];
    // 'preferencia' é opcional (backups feitos sem ela continuam válidos).
    if (linhas === undefined && nome === 'preferencia') {
      tabelas[nome] = [];
      continue;
    }
    if (!Array.isArray(linhas)) {
      return { ok: false, erro: `O backup está incompleto (falta ${nome}).` };
    }
    for (let i = 0; i < linhas.length; i++) {
      const erro = validarLinha(nome, linhas[i], i);
      if (erro) return { ok: false, erro };
    }
    tabelas[nome] = linhas as Linha[];
  }

  const erroReferencia = validarReferencias(tabelas);
  if (erroReferencia) return { ok: false, erro: erroReferencia };

  return {
    ok: true,
    backup: {
      app: 'provazo',
      versao: cru.versao,
      appVersion: typeof cru.appVersion === 'string' ? cru.appVersion : '?',
      exportadoEm: typeof cru.exportadoEm === 'string' ? cru.exportadoEm : '',
      tabelas,
    },
  };
}

export type ResumoBackup = {
  materias: number;
  avaliacoes: number;
  aulas: number;
  compromissos: number;
  tarefas: number;
};

export function resumirBackup(backup: Backup): ResumoBackup {
  const t = backup.tabelas;
  const aulas = t.eventoRecorrente.filter((e) => e.tipo === 'aula').length;
  return {
    materias: t.materia.length,
    avaliacoes: t.avaliacao.length,
    aulas,
    compromissos: t.eventoUnico.length + (t.eventoRecorrente.length - aulas),
    tarefas: t.tarefa.length,
  };
}
