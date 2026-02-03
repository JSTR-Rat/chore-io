PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invite` (
	`id` text PRIMARY KEY NOT NULL,
	`inviting_user_id` text NOT NULL,
	`invited_user_email` text NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`inviting_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invite`("id", "inviting_user_id", "invited_user_email", "property_id", "created_at") SELECT "id", "inviting_user_id", "invited_user_email", "property_id", "created_at" FROM `invite`;--> statement-breakpoint
DROP TABLE `invite`;--> statement-breakpoint
ALTER TABLE `__new_invite` RENAME TO `invite`;--> statement-breakpoint
PRAGMA foreign_keys=ON;