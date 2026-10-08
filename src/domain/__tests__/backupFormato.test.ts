import { describe, expect, it } from 'vitest';

import { resumirBackup, validarBackup, VERSAO_BACKUP } from '../backupFormato';

type BackupCru = {
  app: string;
  versao: number;
  appVersion: string;
  exportadoEm: string;
  tabelas: Record<string, Record<string, unknown>[]>;
};

function backupValido(): BackupCru {
  return {
    app: 'provazo',
    versao: VERSAO_BACKUP,
    appVersion: '2.0.0',
    exportadoEm: '2026-10-08T12:00:00.000Z',
    tabelas: {
      ano: [{ id: 1, valor: 2026 }],
      semestre: [{ id: 1, anoId: 1, numero: 2 }],
      materia: [
        { id: 1, semestreId: 1, nome: 'Cálculo', corHex: '#3B82F6', instituicao: null },
      ],
      avaliacao: [
        {
          id: 1,
          materiaId: 1,
          tipo: 'prova',
          titulo: 'P1',
          data: '2026-10-20',
          hora: '14:00',
          peso: 1,
          nota: null,
          notaMaxima: 10,
          diasAntesLembrete: 1,
          observacoes: null,
          createdAt: '2026-10-01 10:00:00',
          updatedAt: '2026-10-01 10:00:00',
        },
      ],
      eventoRecorrente: [
        {
          id: 1,
          titulo: 'Cálculo',
          tipo: 'aula',
          materiaId: 1,
          corHex: null,
          frequencia: 'semanal',
          dataBase: '2026-08-01',
          horaInicio: '08:00',
          horaFim: '10:00',
          observacoes: null,
        },
      ],
      eventoRecorrenteDiaSemana: [{ id: 1, eventoRecorrenteId: 1, diaSemana: 3 }],
      eventoRecorrenteExcecao: [],
      eventoUnico: [],
      tarefa: [
        { id: 1, titulo: 'Ler', concluida: false, observacoes: null, createdAt: '2026-10-01 10:00:00' },
      ],
    },
  };
}

describe('validarBackup', () => {
  it('aceita um backup completo (preferencia é opcional)', () => {
    const r = validarBackup(backupValido());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.backup.tabelas.preferencia).toEqual([]);
      expect(resumirBackup(r.backup)).toEqual({
        materias: 1,
        avaliacoes: 1,
        aulas: 1,
        compromissos: 0,
        tarefas: 1,
      });
    }
  });

  it('rejeita arquivo que não é do Provazo', () => {
    expect(validarBackup(null).ok).toBe(false);
    expect(validarBackup({ app: 'outro' }).ok).toBe(false);
    expect(validarBackup([]).ok).toBe(false);
  });

  it('rejeita backup de uma versão mais nova', () => {
    const r = validarBackup({ ...backupValido(), versao: VERSAO_BACKUP + 1 });
    expect(r.ok).toBe(false);
  });

  it('rejeita tabela ausente', () => {
    const b = backupValido();
    delete b.tabelas.materia;
    const r = validarBackup(b);
    expect(r).toEqual({ ok: false, erro: 'O backup está incompleto (falta materia).' });
  });

  it('rejeita valor de tipo errado', () => {
    const b = backupValido();
    b.tabelas.avaliacao[0].peso = 'muito';
    const r = validarBackup(b);
    expect(r.ok).toBe(false);
  });

  it('rejeita valor fora das opções permitidas', () => {
    const b = backupValido();
    b.tabelas.avaliacao[0].tipo = 'seminario';
    expect(validarBackup(b).ok).toBe(false);
  });

  it('rejeita chave estrangeira que não existe no arquivo', () => {
    const b = backupValido();
    b.tabelas.avaliacao[0].materiaId = 99;
    const r = validarBackup(b);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain('avaliacao aponta para materia #99');
  });

  it('aceita evento recorrente sem matéria (materiaId nulo)', () => {
    const b = backupValido();
    b.tabelas.eventoRecorrente.push({
      id: 2,
      titulo: 'Academia',
      tipo: 'outro',
      materiaId: null,
      corHex: '#8B5CF6',
      frequencia: 'semanal',
      dataBase: '2026-10-01',
      horaInicio: '18:00',
      horaFim: null,
      observacoes: null,
    });
    const r = validarBackup(b);
    expect(r.ok).toBe(true);
    if (r.ok) expect(resumirBackup(r.backup).compromissos).toBe(1);
  });
});
