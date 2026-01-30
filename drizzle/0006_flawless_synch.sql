-- Rename the old column to frequency
ALTER TABLE `chore` RENAME COLUMN "max_days_between_chores" TO "frequency";--> statement-breakpoint
-- Add frequency_unit with default 'days' for existing records
ALTER TABLE `chore` ADD `frequency_unit` text NOT NULL DEFAULT 'days';