import { eq } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { jSegment, JSegment, InsertJSegment } from '../schema/index';

export function createSegment(data: InsertJSegment): JSegment {
  const db = getDatabase();
  return db.insert(jSegment).values(data).returning().get();
}

export function createSegments(data: InsertJSegment[]): JSegment[] {
  const db = getDatabase();
  if (data.length === 0) return [];
  return db.insert(jSegment).values(data).returning().all();
}

export function getSegmentsByContentId(contentId: number): JSegment[] {
  const db = getDatabase();
  return db.select().from(jSegment).where(eq(jSegment.contentId, contentId)).all();
}
