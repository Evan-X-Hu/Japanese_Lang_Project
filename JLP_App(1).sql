CREATE TABLE "user" (
  "user_id" int PRIMARY KEY,
  "email" varchar,
  "password" varchar,
  "f_name" varchar,
  "l_name" varchar,
  "jlpt_level" int,
  "user_type" int
);

CREATE TABLE "j_content" (
  "content_id" int PRIMARY KEY,
  "title" varchar,
  "duration" float,
  "author" varchar,
  "upload_date" datetime,
  "link" varchar UNIQUE,
  "audio" file
);

CREATE TABLE "j_segment" (
  "segment_id" int PRIMARY KEY,
  "content_id" int,
  "seq_index" int,
  "start_time" float,
  "end_time" float,
  "text" varchar,
  "jlpt_level" int
);

CREATE TABLE "deck" (
  "deck_id" int PRIMARY KEY,
  "user_id" int
);

CREATE TABLE "saved_word" (
  "word_id" int PRIMARY KEY,
  "user_id" int,
  "word" varchar,
  "definition" varchar,
  "conjugations" varchar,
  "notes" varchar
);

CREATE TABLE "master_grammar" (
  "grammar_id" int PRIMARY KEY,
  "user_id" int,
  "jlpt_level" varchar,
  "grammar_point" varchar,
  "meaning" varchar,
  "level" int
);

CREATE TABLE "j_content_user" (
  "content_id" int,
  "user_id" int
);

CREATE TABLE "j_segment_grammar" (
  "grammar_id" int,
  "segment_id" int
);

CREATE TABLE "j_segment_word" (
  "word_id" int,
  "segment_id" int
);

CREATE TABLE "deck_word" (
  "deck_id" int,
  "word_id" int
);

CREATE TABLE "deck_segment" (
  "deck_id" int,
  "segment_id" int
);

CREATE TABLE "deck_grammar" (
  "deck_id" int,
  "grammar_id" int
);

ALTER TABLE "j_segment" ADD FOREIGN KEY ("content_id") REFERENCES "j_content" ("content_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "saved_word" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "master_grammar" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_content_user" ADD FOREIGN KEY ("content_id") REFERENCES "j_content" ("content_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_content_user" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_segment_grammar" ADD FOREIGN KEY ("grammar_id") REFERENCES "master_grammar" ("grammar_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_segment_grammar" ADD FOREIGN KEY ("segment_id") REFERENCES "j_segment" ("segment_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_segment_word" ADD FOREIGN KEY ("word_id") REFERENCES "saved_word" ("word_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "j_segment_word" ADD FOREIGN KEY ("segment_id") REFERENCES "j_segment" ("segment_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_word" ADD FOREIGN KEY ("deck_id") REFERENCES "deck" ("deck_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_word" ADD FOREIGN KEY ("word_id") REFERENCES "saved_word" ("word_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_segment" ADD FOREIGN KEY ("deck_id") REFERENCES "deck" ("deck_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_segment" ADD FOREIGN KEY ("segment_id") REFERENCES "j_segment" ("segment_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_grammar" ADD FOREIGN KEY ("deck_id") REFERENCES "deck" ("deck_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "deck_grammar" ADD FOREIGN KEY ("grammar_id") REFERENCES "master_grammar" ("grammar_id") DEFERRABLE INITIALLY IMMEDIATE;
