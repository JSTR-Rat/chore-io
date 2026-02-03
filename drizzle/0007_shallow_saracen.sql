CREATE TABLE `invite` (
	`id` text PRIMARY KEY NOT NULL,
	`inviting_user_id` text NOT NULL,
	`invited_user_id` text NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`inviting_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON UPDATE no action ON DELETE cascade
);
