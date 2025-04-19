ALTER TABLE `events` ADD `delegator` text;--> statement-breakpoint
CREATE INDEX `detegator_idx` ON `events` (`delegator`);