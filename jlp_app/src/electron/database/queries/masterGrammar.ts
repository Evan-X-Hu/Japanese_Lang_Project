import { eq } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { masterGrammar, MasterGrammar } from '../schema/index';

type GrammarSeedEntry = {
  grammar_id: number;
  JLPT_level: string;
  grammar_point: string;
  meaning: string;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const grammarSeed: GrammarSeedEntry[] = require('../seeds/masterGrammars.json');

// 5 insert columns per row; SQLite limit is 999 variables → max 199 rows per batch
const BATCH_SIZE = 199;

/**
 * Inserts all JLPT grammar points for a newly created user.
 * grammarId is the 0-based seed index used by the regex parser.
 * masterGrammarId is auto-assigned by SQLite and used as the FK in j_segment_grammar.
 * Call this immediately after creating a user row.
 */
export function seedGrammarForUser(userId: number): void {
  const db = getDatabase();

  const rows = grammarSeed.map((entry) => ({
    grammarId: entry.grammar_id,
    userId,
    jlptLevel: entry.JLPT_level,
    grammarPoint: entry.grammar_point,
    meaning: entry.meaning,
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    db.insert(masterGrammar).values(rows.slice(i, i + BATCH_SIZE)).run();
  }
}

export function getGrammarForUser(userId: number): MasterGrammar[] {
  const db = getDatabase();
  return db.select().from(masterGrammar).where(eq(masterGrammar.userId, userId)).all();
}
