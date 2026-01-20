import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

let db: Database.Database | null = null

export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}

export const initDatabase = async (): Promise<Database.Database> => {
  // Store database in user's app data directory
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'github-dashboard.db')

  console.log('Initializing database at:', dbPath)

  db = new Database(dbPath)

  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id INTEGER UNIQUE NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      access_token TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Repositories table
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      github_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      description TEXT,
      html_url TEXT NOT NULL,
      homepage TEXT,
      language TEXT,
      topics TEXT DEFAULT '[]',
      is_fork INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      is_template INTEGER DEFAULT 0,
      is_private INTEGER DEFAULT 0,
      stars_count INTEGER DEFAULT 0,
      forks_count INTEGER DEFAULT 0,
      watchers_count INTEGER DEFAULT 0,
      open_issues_count INTEGER DEFAULT 0,
      pushed_at TEXT,
      created_at_github TEXT,
      updated_at_github TEXT,
      priority_score INTEGER DEFAULT 0,
      health_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      synced_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Repository snapshots for historical tracking
    CREATE TABLE IF NOT EXISTS repository_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
      stars_count INTEGER DEFAULT 0,
      forks_count INTEGER DEFAULT 0,
      watchers_count INTEGER DEFAULT 0,
      open_issues_count INTEGER DEFAULT 0,
      priority_score INTEGER DEFAULT 0,
      health_score INTEGER DEFAULT 0,
      snapshot_at TEXT DEFAULT (datetime('now'))
    );

    -- Repository notes
    CREATE TABLE IF NOT EXISTS repository_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Action logs
    CREATE TABLE IF NOT EXISTS action_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
    CREATE INDEX IF NOT EXISTS idx_repositories_github_id ON repositories(github_id);
    CREATE INDEX IF NOT EXISTS idx_repository_snapshots_repository_id ON repository_snapshots(repository_id);
    CREATE INDEX IF NOT EXISTS idx_repository_notes_repository_id ON repository_notes(repository_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON action_logs(user_id);
  `)

  return db
}

export const closeDatabase = (): void => {
  if (db) {
    db.close()
    db = null
  }
}
