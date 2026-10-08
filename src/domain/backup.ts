import { db } from '../db/client';
import {
  ano,
  avaliacao,
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  eventoUnico,
  materia,
  preferencia,
  semestre,
  tarefa,
} from '../db/schema';
import {
  type Backup,
  type NomeTabela,
  ORDEM_TABELAS,
  VERSAO_BACKUP,
} from './backupFormato';

const TABELAS = {
  ano,
  semestre,
  materia,
  avaliacao,
  eventoRecorrente,
  eventoRecorrenteDiaSemana,
  eventoRecorrenteExcecao,
  eventoUnico,
  tarefa,
  preferencia,
} as const;

// SQLite limita as variáveis por comando; lotes pequenos ficam bem abaixo disso.
const LINHAS_POR_LOTE = 25;

/** Lê todas as tabelas do banco num objeto pronto pra virar JSON. */
export function gerarBackup(appVersion: string): Backup {
  const tabelas = {} as Backup['tabelas'];
  for (const nome of ORDEM_TABELAS) {
    tabelas[nome] = db.select().from(TABELAS[nome]).all();
  }
  return {
    app: 'provazo',
    versao: VERSAO_BACKUP,
    appVersion,
    exportadoEm: new Date().toISOString(),
    tabelas,
  };
}

/**
 * Substitui TODOS os dados atuais pelos do backup (já validado), preservando
 * os ids. Tudo numa transação: se algo falhar, nada é apagado.
 */
export function restaurarBackup(backup: Backup): void {
  db.transaction((tx) => {
    for (const nome of [...ORDEM_TABELAS].reverse()) {
      tx.delete(TABELAS[nome]).run();
    }
    for (const nome of ORDEM_TABELAS) {
      const linhas = backup.tabelas[nome as NomeTabela];
      for (let i = 0; i < linhas.length; i += LINHAS_POR_LOTE) {
        // As linhas já passaram por validarBackup, que garante o formato.
        tx.insert(TABELAS[nome])
          .values(linhas.slice(i, i + LINHAS_POR_LOTE) as never)
          .run();
      }
    }
  });
}
