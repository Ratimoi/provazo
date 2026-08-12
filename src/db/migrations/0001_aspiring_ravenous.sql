CREATE TABLE `tarefa` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`concluida` integer DEFAULT false NOT NULL,
	`observacoes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
