import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

export const ano = sqliteTable('ano', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  valor: integer('valor').notNull().unique(),
});

export const semestre = sqliteTable(
  'semestre',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    anoId: integer('ano_id')
      .notNull()
      .references(() => ano.id, { onDelete: 'cascade' }),
    numero: integer('numero').notNull(),
  },
  (table) => [
    unique('semestre_ano_numero_unique').on(table.anoId, table.numero),
    check('semestre_numero_check', sql`${table.numero} IN (1, 2)`),
  ],
);

export const materia = sqliteTable(
  'materia',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    semestreId: integer('semestre_id')
      .notNull()
      .references(() => semestre.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    corHex: text('cor_hex').notNull(),
  },
  (table) => [
    unique('materia_semestre_nome_unique').on(table.semestreId, table.nome),
  ],
);

export const avaliacao = sqliteTable(
  'avaliacao',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    materiaId: integer('materia_id')
      .notNull()
      .references(() => materia.id, { onDelete: 'cascade' }),
    tipo: text('tipo', { enum: ['prova', 'trabalho'] }).notNull(),
    titulo: text('titulo').notNull(),
    // ISO date (YYYY-MM-DD)
    data: text('data').notNull(),
    // HH:MM
    hora: text('hora').notNull(),
    peso: real('peso').notNull(),
    nota: real('nota'),
    notaMaxima: real('nota_maxima').notNull().default(10),
    diasAntesLembrete: integer('dias_antes_lembrete').notNull().default(1),
    observacoes: text('observacoes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_avaliacao_data').on(table.data)],
);

// Aulas, aniversários e outros eventos que se repetem
export const eventoRecorrente = sqliteTable(
  'evento_recorrente',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    titulo: text('titulo').notNull(),
    tipo: text('tipo', { enum: ['aula', 'aniversario', 'outro'] }).notNull(),
    materiaId: integer('materia_id').references(() => materia.id, {
      onDelete: 'cascade',
    }),
    corHex: text('cor_hex'),
    frequencia: text('frequencia', {
      enum: ['semanal', 'mensal', 'anual'],
    }).notNull(),
    dataBase: text('data_base').notNull(),
    horaInicio: text('hora_inicio').notNull(),
    horaFim: text('hora_fim'),
    observacoes: text('observacoes'),
  },
  (table) => [
    // 'aula' sempre tem materiaId e herda a cor dela; os demais tipos
    // não têm materiaId e precisam do próprio corHex
    check(
      'evento_recorrente_materia_cor_check',
      sql`(${table.tipo} = 'aula' AND ${table.materiaId} IS NOT NULL AND ${table.corHex} IS NULL)
        OR (${table.tipo} != 'aula' AND ${table.materiaId} IS NULL AND ${table.corHex} IS NOT NULL)`,
    ),
  ],
);

// Dias da semana em que um evento 'semanal' ocorre (many-to-many simplificado)
export const eventoRecorrenteDiaSemana = sqliteTable(
  'evento_recorrente_dia_semana',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoRecorrenteId: integer('evento_recorrente_id')
      .notNull()
      .references(() => eventoRecorrente.id, { onDelete: 'cascade' }),
    // 0 = domingo
    diaSemana: integer('dia_semana').notNull(),
  },
  (table) => [
    unique('evento_recorrente_dia_semana_unique').on(
      table.eventoRecorrenteId,
      table.diaSemana,
    ),
    check(
      'evento_recorrente_dia_semana_check',
      sql`${table.diaSemana} BETWEEN 0 AND 6`,
    ),
  ],
);

// Datas em que um evento recorrente específico não deve aparecer (feriado, aula cancelada)
export const eventoRecorrenteExcecao = sqliteTable(
  'evento_recorrente_excecao',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoRecorrenteId: integer('evento_recorrente_id')
      .notNull()
      .references(() => eventoRecorrente.id, { onDelete: 'cascade' }),
    data: text('data').notNull(),
  },
  (table) => [
    unique('evento_recorrente_excecao_unique').on(
      table.eventoRecorrenteId,
      table.data,
    ),
  ],
);

// Compromissos pontuais sem vínculo com matéria (ex: reunião, consulta)
export const eventoUnico = sqliteTable(
  'evento_unico',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    titulo: text('titulo').notNull(),
    data: text('data').notNull(),
    horaInicio: text('hora_inicio').notNull(),
    horaFim: text('hora_fim'),
    corHex: text('cor_hex').notNull(),
    observacoes: text('observacoes'),
  },
  (table) => [index('idx_evento_unico_data').on(table.data)],
);

// Tarefas soltas, sem data/hora — coisas pra fazer "em algum momento"
// (ex: "continuar o learncpp"), fora do fluxo de provas/trabalhos/timeline.
export const tarefa = sqliteTable('tarefa', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull(),
  concluida: integer('concluida', { mode: 'boolean' }).notNull().default(false),
  observacoes: text('observacoes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
