CREATE TABLE `deck` (
	`deck_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `deck_grammar` (
	`deck_id` integer NOT NULL,
	`master_grammar_id` integer NOT NULL,
	PRIMARY KEY(`deck_id`, `master_grammar_id`),
	FOREIGN KEY (`deck_id`) REFERENCES `deck`(`deck_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`master_grammar_id`) REFERENCES `master_grammar`(`master_grammar_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `deck_segment` (
	`deck_id` integer NOT NULL,
	`segment_id` integer NOT NULL,
	PRIMARY KEY(`deck_id`, `segment_id`),
	FOREIGN KEY (`deck_id`) REFERENCES `deck`(`deck_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`segment_id`) REFERENCES `j_segment`(`segment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `deck_word` (
	`deck_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	PRIMARY KEY(`deck_id`, `word_id`),
	FOREIGN KEY (`deck_id`) REFERENCES `deck`(`deck_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`word_id`) REFERENCES `saved_word`(`word_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `j_content` (
	`content_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`duration` real,
	`author` text,
	`upload_date` integer,
	`link` text,
	`audio` text,
	`video` text,
	`vtt` text
);
--> statement-breakpoint
CREATE TABLE `j_content_user` (
	`content_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`content_id`, `user_id`),
	FOREIGN KEY (`content_id`) REFERENCES `j_content`(`content_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `j_segment` (
	`segment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content_id` integer,
	`seq_index` integer,
	`start_time` real,
	`end_time` real,
	`text` text,
	`jlpt_level` integer,
	FOREIGN KEY (`content_id`) REFERENCES `j_content`(`content_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `j_segment_grammar` (
	`master_grammar_id` integer NOT NULL,
	`segment_id` integer NOT NULL,
	PRIMARY KEY(`master_grammar_id`, `segment_id`),
	FOREIGN KEY (`master_grammar_id`) REFERENCES `master_grammar`(`master_grammar_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`segment_id`) REFERENCES `j_segment`(`segment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `j_segment_word` (
	`segment_id` integer NOT NULL,
	`word_id` integer NOT NULL,
	PRIMARY KEY(`segment_id`, `word_id`),
	FOREIGN KEY (`segment_id`) REFERENCES `j_segment`(`segment_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`word_id`) REFERENCES `saved_word`(`word_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `master_grammar` (
	`master_grammar_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`grammar_id` integer,
	`user_id` integer,
	`jlpt_level` text,
	`grammar_point` text,
	`meaning` text,
	`level` integer,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `saved_word` (
	`word_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`word` text,
	`definition` text,
	`conjugations` text,
	`notes` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`password` text,
	`f_name` text,
	`l_name` text,
	`jlpt_level` integer,
	`user_type` integer
);
