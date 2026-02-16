// Database schema definitions
// Export all table schemas from this file.
//
// Example:
//   export { vocabulary } from './vocabulary';
//   export { decks } from './decks';
//
// When you add a new table file, re-export it here so that
// drizzle-kit picks it up during `npm run db:generate`.

import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";

// ============================================================
// Root Tables
// ============================================================

export const user = sqliteTable("user", {
  userId: integer("user_id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  password: text("password"),
  fName: text("f_name"),
  lName: text("l_name"),
  jlptLevel: integer("jlpt_level"),
  userType: integer("user_type"),
});

export const jContent = sqliteTable("j_content", {
  contentId: integer("content_id").primaryKey({ autoIncrement: true }),
  title: text("title"),
  duration: real("duration"),
  author: text("author"),
  uploadDate: integer("upload_date", { mode: "timestamp" }),
  link: text("link").unique(),
  audio: text("audio"), // file path or blob reference stored as text
});

// ============================================================
// Child Tables
// ============================================================

export const jSegment = sqliteTable("j_segment", {
  segmentId: integer("segment_id").primaryKey({ autoIncrement: true }),
  contentId: integer("content_id")
    .references(() => jContent.contentId, { onDelete: "cascade" }),
  seqIndex: integer("seq_index"),
  startTime: real("start_time"),
  endTime: real("end_time"),
  text: text("text"),
  jlptLevel: integer("jlpt_level"),
});

export const deck = sqliteTable("deck", {
  deckId: integer("deck_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => user.userId, { onDelete: "cascade" }),
});

export const savedWord = sqliteTable("saved_word", {
  wordId: integer("word_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => user.userId, { onDelete: "cascade" }),
  word: text("word"),
  definition: text("definition"),
  conjugations: text("conjugations"),
  notes: text("notes"),
});

export const savedGrammar = sqliteTable("saved_grammar", {
  grammarId: integer("grammar_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => user.userId, { onDelete: "cascade" }),
  jlptLevel: integer("jlpt_level"),
  examples: text("examples"),
  notes: text("notes"),
});

// ============================================================
// Junction Tables
// ============================================================

export const jContentUser = sqliteTable(
  "j_content_user",
  {
    contentId: integer("content_id")
      .notNull()
      .references(() => jContent.contentId, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => user.userId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.contentId, table.userId] }),
  ]
);

export const jSegmentGrammar = sqliteTable(
  "j_segment_grammar",
  {
    grammarId: integer("grammar_id")
      .notNull()
      .references(() => savedGrammar.grammarId, { onDelete: "cascade" }),
    segmentId: integer("segment_id")
      .notNull()
      .references(() => jSegment.segmentId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.grammarId, table.segmentId] }),
  ]
);

export const jSegmentWord = sqliteTable(
  "j_segment_word",
  {
    segmentId: integer("segment_id")
      .notNull()
      .references(() => jSegment.segmentId, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => savedWord.wordId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.segmentId, table.wordId] }),
  ]
);

export const deckWord = sqliteTable(
  "deck_word",
  {
    deckId: integer("deck_id")
      .notNull()
      .references(() => deck.deckId, { onDelete: "cascade" }),
    wordId: integer("word_id")
      .notNull()
      .references(() => savedWord.wordId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.deckId, table.wordId] }),
  ]
);

export const deckSegment = sqliteTable(
  "deck_segment",
  {
    deckId: integer("deck_id")
      .notNull()
      .references(() => deck.deckId, { onDelete: "cascade" }),
    segmentId: integer("segment_id")
      .notNull()
      .references(() => jSegment.segmentId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.deckId, table.segmentId] }),
  ]
);

export const deckGrammar = sqliteTable(
  "deck_grammar",
  {
    deckId: integer("deck_id")
      .notNull()
      .references(() => deck.deckId, { onDelete: "cascade" }),
    grammarId: integer("grammar_id")
      .notNull()
      .references(() => savedGrammar.grammarId, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.deckId, table.grammarId] }),
  ]
);

// ============================================================
// Type Exports
// ============================================================

export type User = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;

export type JContent = typeof jContent.$inferSelect;
export type InsertJContent = typeof jContent.$inferInsert;

export type JSegment = typeof jSegment.$inferSelect;
export type InsertJSegment = typeof jSegment.$inferInsert;

export type Deck = typeof deck.$inferSelect;
export type InsertDeck = typeof deck.$inferInsert;

export type SavedWord = typeof savedWord.$inferSelect;
export type InsertSavedWord = typeof savedWord.$inferInsert;

export type SavedGrammar = typeof savedGrammar.$inferSelect;
export type InsertSavedGrammar = typeof savedGrammar.$inferInsert;