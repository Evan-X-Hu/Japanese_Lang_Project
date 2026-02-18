import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

let db: BetterSQLite3Database | null = null;
let sqlite: Database.Database | null = null;

/**
 * Resolve the path to the drizzle migration files.
 *
 * In development, migrations live at <project-root>/drizzle/.
 * In production (packaged), they are copied to resources/drizzle/
 * via extraResource in forge.config.ts.
 */
function getMigrationsPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'drizzle');
  }
  return path.join(app.getAppPath(), 'drizzle');
}

/**
 * Initialize the SQLite database and run all pending migrations.
 * Must be called after app.whenReady() since app.getPath('userData')
 * is not available before that.
 */
export function initializeDatabase(): BetterSQLite3Database {
  if (db) {
    return db;
  }

  // Path to: <user>/.config/jlp_app/jlp_app.db (stores database)
  const dbPath = path.join(app.getPath('userData'), 'jlp_app.db');

  // Path to: <user>/.config/jlp_app/media (stores media files)
  const mediaRoot = path.join(app.getPath('userData'), 'media');
  fs.mkdirSync(mediaRoot, { recursive: true });
  
  sqlite = new Database(dbPath);

  // WAL mode for better read performance
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma("foreign_keys = ON");

  db = drizzle(sqlite);

  // Run pending migrations
  const migrationsFolder = getMigrationsPath();
  migrate(db, { migrationsFolder });

  return db;
}

/**
 * Get the existing Drizzle database instance.
 * Throws if initializeDatabase() has not been called.
 */
export function getDatabase(): BetterSQLite3Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection. Call on app quit.
 */
export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
  }
}