import { eq } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { jContent, JContent, InsertJContent } from '../schema/index';

export function getAllContent(): JContent[] {
  const db = getDatabase();
  return db.select().from(jContent).all();
}

export function getContentById(contentId: number): JContent | undefined {
  const db = getDatabase();
  return db.select().from(jContent).where(eq(jContent.contentId, contentId)).get();
}

export function createContent(data: InsertJContent): JContent {
  const db = getDatabase();
  return db.insert(jContent).values(data).returning().get();
}

export function updateContent(contentId: number, data: Partial<InsertJContent>): JContent | undefined {
  const db = getDatabase();
  return db.update(jContent).set(data).where(eq(jContent.contentId, contentId)).returning().get();
}

export function deleteContent(contentId: number): JContent | undefined {
  const db = getDatabase();
  return db.delete(jContent).where(eq(jContent.contentId, contentId)).returning().get();
}
