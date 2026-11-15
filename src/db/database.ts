import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { runMigrations } from './migrations.ts';
import { seedInitialContent } from './seed.ts';

let dbInstance: Database.Database | null = null;

export function getDb(customPath?: string): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = customPath || process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'unitraca.db');
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  seedInitialContent(db);

  dbInstance = db;
  return db;
}

export function resetDbInstanceForTests(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
