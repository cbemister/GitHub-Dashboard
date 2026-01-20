import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let sqlite: Database.Database | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDbPath(): string {
  // In production Electron app, use app data directory
  // In development, use project root
  const dbDir = process.env.DATABASE_DIR || process.cwd();
  const dbPath = path.join(dbDir, "github-dashboard.db");

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dbPath;
}

function getDb() {
  if (!database) {
    const dbPath = getDbPath();
    console.log(`Opening SQLite database at: ${dbPath}`);

    sqlite = new Database(dbPath);

    // Enable WAL mode for better concurrent access
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    database = drizzle(sqlite, { schema });
  }

  return database;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const database = getDb();
    const value = database[prop as keyof typeof database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

// Export function to close database (useful for cleanup)
export function closeDb() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    database = null;
  }
}

// Export function to get the database path
export function getDatabasePath() {
  return getDbPath();
}

export * from "./schema";
