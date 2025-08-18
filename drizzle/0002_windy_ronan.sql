ALTER TABLE `users` ADD `active_from` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `active_to` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `is_public` integer DEFAULT false;