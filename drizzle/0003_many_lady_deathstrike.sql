DROP TABLE `chore_history`;--> statement-breakpoint
ALTER TABLE `chore` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `chore` ADD `max_days_between_chores` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `chore` ADD `last_completed_date` integer;--> statement-breakpoint
ALTER TABLE `chore` ADD `updated_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `chore` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `chore` DROP COLUMN `frequency`;--> statement-breakpoint
ALTER TABLE `chore` DROP COLUMN `frequency_unit`;