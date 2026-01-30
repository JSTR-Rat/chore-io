PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_to_property` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`property_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_to_property`("id", "user_id", "property_id", "created_at") SELECT "id", "user_id", "property_id", "created_at" FROM `user_to_property`;--> statement-breakpoint
DROP TABLE `user_to_property`;--> statement-breakpoint
ALTER TABLE `__new_user_to_property` RENAME TO `user_to_property`;--> statement-breakpoint
PRAGMA foreign_keys=ON;