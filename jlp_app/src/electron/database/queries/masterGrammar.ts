import { eq } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { masterGrammar, MasterGrammar } from '../schema/index';
import grammarSeed from '../seeds/masterGrammars.json';

export function seedGrammarForUser(userId: number): void {
  const db = getDatabase();
  db.insert(masterGrammar)
    .values(
      grammarSeed.map((entry) => ({
        grammarId: entry.grammar_id,
        userId,
        jlptLevel: entry.JLPT_level,
        grammarPoint: entry.grammar_point,
        meaning: entry.meaning,
        level: 3,
      }))
    )
    .run();
}

export function getMasterGrammarByUserId(userId: number): MasterGrammar[] {
  const db = getDatabase();
  return db
    .select()
    .from(masterGrammar)
    .where(eq(masterGrammar.userId, userId))
    .all();
}

export function updateMasterGrammar(
  masterGrammarId: number,
  data: { level?: number | null; notes?: string | null }
): MasterGrammar | undefined {
  const db = getDatabase();
  return db
    .update(masterGrammar)
    .set(data)
    .where(eq(masterGrammar.masterGrammarId, masterGrammarId))
    .returning()
    .get();
}
