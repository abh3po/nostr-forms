CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` integer NOT NULL,
	`author` text NOT NULL,
	`sig` text NOT NULL,
	`hidden` integer NOT NULL,
	`content` text NOT NULL,
	`first_seen` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`rest` text
);
--> statement-breakpoint
CREATE INDEX `kind_idx` ON `events` (`kind`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `events` (`author`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `events` (`created_at`);--> statement-breakpoint
CREATE INDEX `kind_composite_idx` ON `events` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `kind_author_idx` ON `events` (`kind`,`author`);--> statement-breakpoint
CREATE INDEX `author_created_at_idx` ON `events` (`author`,`created_at`);--> statement-breakpoint
CREATE INDEX `author_kind_idx` ON `events` (`author`,`kind`);--> statement-breakpoint
CREATE INDEX `event_id_idx` ON `tags` (`event_id`);--> statement-breakpoint
CREATE INDEX `tag_value_idx` ON `tags` (`value`);--> statement-breakpoint
CREATE INDEX `tag_composite_idx` ON `tags` (`event_id`,`name`,`value`);--> statement-breakpoint
CREATE INDEX `tag_name_event_id_idx` ON `tags` (`name`,`event_id`,`value`);