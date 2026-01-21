import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let sqlite: Database.Database | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get the database file path based on environment
 * - Development: .data folder (excluded from file watching)
 * - Production/Electron: app data directory
 */
function getDatabasePath(): string {
  // For Electron production builds, use app data directory
  if (process.env.ELECTRON_APP_DATA_PATH) {
    return path.join(process.env.ELECTRON_APP_DATA_PATH, "github-dashboard.db");
  }

  // For development, use .data folder to avoid triggering Fast Refresh
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return path.join(dataDir, "github-dashboard.db");
}

function getDb() {
  if (!database) {
    const dbPath = getDatabasePath();

    // Create SQLite connection with WAL mode for better concurrency
    sqlite = new Database(dbPath);
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

// Export function to close database connection (useful for Electron app lifecycle)
export function closeDatabase() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    database = null;
  }
}

export * from "./schema";
