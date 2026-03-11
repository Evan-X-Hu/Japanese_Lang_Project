import { eq } from 'drizzle-orm';
import { getDatabase } from '../connection';
import { user, User, InsertUser } from '../schema/index';

export function createUser(data: InsertUser): User {
  const db = getDatabase();
  return db.insert(user).values(data).returning().get();
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  return db.select().from(user).all();
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDatabase();
  return db.select().from(user).where(eq(user.email, email)).get();
}

export function getUserById(userId: number): User | undefined {
  const db = getDatabase();
  return db.select().from(user).where(eq(user.userId, userId)).get();
}

export function deleteUser(userId: number): void {
  const db = getDatabase();
  db.delete(user).where(eq(user.userId, userId)).run();
}
