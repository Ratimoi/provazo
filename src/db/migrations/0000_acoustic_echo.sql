CREATE TABLE `ano` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`valor` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ano_valor_unique` ON `ano` (`valor`);--> statement-breakpoint
CREATE TABLE `avaliacao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`materia_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`data` text NOT NULL,
	`hora` text NOT NULL,
	`peso` real NOT NULL,
	`nota` real,
	`nota_maxima` real DEFAULT 10 NOT NULL,
	`dias_antes_lembrete` integer DEFAULT 1 NOT NULL,
	`observacoes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`materia_id`) REFERENCES `materia`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_avaliacao_data` ON `avaliacao` (`data`);--> statement-breakpoint
CREATE TABLE `evento_recorrente` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`tipo` text NOT NULL,
	`materia_id` integer,
	`cor_hex` text,
	`frequencia` text NOT NULL,
	`data_base` text NOT NULL,
	`hora_inicio` text NOT NULL,
	`hora_fim` text,
	FOREIGN KEY (`materia_id`) REFERENCES `materia`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "evento_recorrente_materia_cor_check" CHECK(("evento_recorrente"."tipo" = 'aula' AND "evento_recorrente"."materia_id" IS NOT NULL AND "evento_recorrente"."cor_hex" IS NULL)
        OR ("evento_recorrente"."tipo" != 'aula' AND "evento_recorrente"."materia_id" IS NULL AND "evento_recorrente"."cor_hex" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE `evento_recorrente_dia_semana` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`evento_recorrente_id` integer NOT NULL,
	`dia_semana` integer NOT NULL,
	FOREIGN KEY (`evento_recorrente_id`) REFERENCES `evento_recorrente`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "evento_recorrente_dia_semana_check" CHECK("evento_recorrente_dia_semana"."dia_semana" BETWEEN 0 AND 6)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evento_recorrente_dia_semana_unique` ON `evento_recorrente_dia_semana` (`evento_recorrente_id`,`dia_semana`);--> statement-breakpoint
CREATE TABLE `evento_recorrente_excecao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`evento_recorrente_id` integer NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`evento_recorrente_id`) REFERENCES `evento_recorrente`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evento_recorrente_excecao_unique` ON `evento_recorrente_excecao` (`evento_recorrente_id`,`data`);--> statement-breakpoint
CREATE TABLE `evento_unico` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`data` text NOT NULL,
	`hora_inicio` text NOT NULL,
	`hora_fim` text,
	`cor_hex` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_evento_unico_data` ON `evento_unico` (`data`);--> statement-breakpoint
CREATE TABLE `materia` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`semestre_id` integer NOT NULL,
	`nome` text NOT NULL,
	`cor_hex` text NOT NULL,
	FOREIGN KEY (`semestre_id`) REFERENCES `semestre`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materia_semestre_nome_unique` ON `materia` (`semestre_id`,`nome`);--> statement-breakpoint
CREATE TABLE `semestre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ano_id` integer NOT NULL,
	`numero` integer NOT NULL,
	FOREIGN KEY (`ano_id`) REFERENCES `ano`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "semestre_numero_check" CHECK("semestre"."numero" IN (1, 2))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `semestre_ano_numero_unique` ON `semestre` (`ano_id`,`numero`);