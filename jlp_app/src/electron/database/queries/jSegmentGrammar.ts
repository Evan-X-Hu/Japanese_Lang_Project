import { and, eq, inArray } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { masterGrammar, jSegmentGrammar } from '../schema/index';

// j_segment_grammar has 2 columns; SQLite limit is 999 variables → max 499 rows per batch
const BATCH_SIZE = 499;

/**
 * Links detected grammar patterns to their segments in j_segment_grammar.
 *
 * Steps:
 *  1. Collect unique grammar_ids from the pairs.
 *  2. Query master_grammar to resolve grammar_id → master_grammar_id for this user.
 *  3. Batch-insert (master_grammar_id, segment_id) rows into j_segment_grammar.
 */
export function linkGrammarToSegments(
  userId: number,
  pairs: Array<{ segmentId: number; grammarId: number }>
): void {
  if (pairs.length === 0) return;

  const db = getDatabase();

  const uniqueGrammarIds = [...new Set(pairs.map((p) => p.grammarId))];
  console.log(`[linkGrammar] userId=${userId}, uniqueGrammarIds count=${uniqueGrammarIds.length}`);

  const grammarRows = db
    .select({
      grammarId: masterGrammar.grammarId,
      masterGrammarId: masterGrammar.masterGrammarId,
    })
    .from(masterGrammar)
    .where(
      and(
        eq(masterGrammar.userId, userId),
        inArray(masterGrammar.grammarId, uniqueGrammarIds)
      )
    )
    .all();

  console.log(`[linkGrammar] master_grammar lookup returned ${grammarRows.length} rows`);

  // Build grammarId → masterGrammarId map
  const idMap = new Map<number, number>();
  for (const row of grammarRows) {
    if (row.grammarId !== null && row.masterGrammarId !== null) {
      idMap.set(row.grammarId, row.masterGrammarId);
    }
  }

  const insertRows = pairs
    .filter((p) => idMap.has(p.grammarId))
    .map((p) => ({
      masterGrammarId: idMap.get(p.grammarId)!,
      segmentId: p.segmentId,
    }));

  console.log(`[linkGrammar] inserting ${insertRows.length} rows into j_segment_grammar`);

  for (let i = 0; i < insertRows.length; i += BATCH_SIZE) {
    db.insert(jSegmentGrammar).values(insertRows.slice(i, i + BATCH_SIZE)).run();
  }
}
