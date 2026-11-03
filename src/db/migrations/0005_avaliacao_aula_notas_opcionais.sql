PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_avaliacao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`materia_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`data` text NOT NULL,
	`hora` text NOT NULL,
	`peso` real,
	`nota` real,
	`nota_maxima` real,
	`dias_antes_lembrete` integer DEFAULT 1 NOT NULL,
	`observacoes` text,
	`evento_recorrente_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`materia_id`) REFERENCES `materia`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`evento_recorrente_id`) REFERENCES `evento_recorrente`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_avaliacao`("id", "materia_id", "tipo", "titulo", "data", "hora", "peso", "nota", "nota_maxima", "dias_antes_lembrete", "observacoes", "created_at", "updated_at") SELECT "id", "materia_id", "tipo", "titulo", "data", "hora", "peso", "nota", "nota_maxima", "dias_antes_lembrete", "observacoes", "created_at", "updated_at" FROM `avaliacao`;--> statement-breakpoint
DROP TABLE `avaliacao`;--> statement-breakpoint
ALTER TABLE `__new_avaliacao` RENAME TO `avaliacao`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_avaliacao_data` ON `avaliacao` (`data`);