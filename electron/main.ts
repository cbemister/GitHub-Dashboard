import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, getDatabase } from './database'

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// Initialize the database and set up IPC handlers
const setupApp = async () => {
  try {
    await initDatabase()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }

  // Set up IPC handlers for database operations
  setupIpcHandlers()
}

const setupIpcHandlers = () => {
  const db = getDatabase()

  // Get all users
  ipcMain.handle('db:getUsers', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM users')
      return stmt.all()
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  })

  // Get user by ID
  ipcMain.handle('db:getUserById', async (_event, id: number) => {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
      return stmt.get(id)
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  })

  // Get user by GitHub ID
  ipcMain.handle('db:getUserByGithubId', async (_event, githubId: number) => {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE github_id = ?')
      return stmt.get(githubId)
    } catch (error) {
      console.error('Error getting user by GitHub ID:', error)
      return null
    }
  })

  // Create or update user
  ipcMain.handle('db:upsertUser', async (_event, user: {
    github_id: number
    username: string
    avatar_url?: string
    access_token: string
  }) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO users (github_id, username, avatar_url, access_token, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(github_id) DO UPDATE SET
          username = excluded.username,
          avatar_url = excluded.avatar_url,
          access_token = excluded.access_token,
          updated_at = datetime('now')
        RETURNING *
      `)
      return stmt.get(user.github_id, user.username, user.avatar_url || null, user.access_token)
    } catch (error) {
      console.error('Error upserting user:', error)
      return null
    }
  })

  // Get all repositories for a user
  ipcMain.handle('db:getRepositories', async (_event, userId: number) => {
    try {
      const stmt = db.prepare('SELECT * FROM repositories WHERE user_id = ? ORDER BY priority_score DESC')
      return stmt.all(userId)
    } catch (error) {
      console.error('Error getting repositories:', error)
      return []
    }
  })

  // Get repository by ID
  ipcMain.handle('db:getRepositoryById', async (_event, id: number) => {
    try {
      const stmt = db.prepare('SELECT * FROM repositories WHERE id = ?')
      return stmt.get(id)
    } catch (error) {
      console.error('Error getting repository:', error)
      return null
    }
  })

  // Upsert repository
  ipcMain.handle('db:upsertRepository', async (_event, repo: {
    user_id: number
    github_id: number
    name: string
    full_name: string
    description?: string
    html_url: string
    homepage?: string
    language?: string
    topics?: string[]
    is_fork: boolean
    is_archived: boolean
    is_template: boolean
    is_private: boolean
    stars_count: number
    forks_count: number
    watchers_count: number
    open_issues_count: number
    pushed_at?: string
    created_at_github?: string
    updated_at_github?: string
    priority_score?: number
    health_score?: number
    status?: string
  }) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO repositories (
          user_id, github_id, name, full_name, description, html_url, homepage,
          language, topics, is_fork, is_archived, is_template, is_private, stars_count,
          forks_count, watchers_count, open_issues_count, pushed_at,
          created_at_github, updated_at_github, priority_score, health_score, status, synced_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(github_id) DO UPDATE SET
          name = excluded.name,
          full_name = excluded.full_name,
          description = excluded.description,
          html_url = excluded.html_url,
          homepage = excluded.homepage,
          language = excluded.language,
          topics = excluded.topics,
          is_fork = excluded.is_fork,
          is_archived = excluded.is_archived,
          is_template = excluded.is_template,
          is_private = excluded.is_private,
          stars_count = excluded.stars_count,
          forks_count = excluded.forks_count,
          watchers_count = excluded.watchers_count,
          open_issues_count = excluded.open_issues_count,
          pushed_at = excluded.pushed_at,
          created_at_github = excluded.created_at_github,
          updated_at_github = excluded.updated_at_github,
          priority_score = excluded.priority_score,
          health_score = excluded.health_score,
          status = excluded.status,
          synced_at = datetime('now')
        RETURNING *
      `)
      return stmt.get(
        repo.user_id, repo.github_id, repo.name, repo.full_name, repo.description || null,
        repo.html_url, repo.homepage || null, repo.language || null,
        JSON.stringify(repo.topics || []), repo.is_fork ? 1 : 0, repo.is_archived ? 1 : 0,
        repo.is_template ? 1 : 0, repo.is_private ? 1 : 0, repo.stars_count, repo.forks_count,
        repo.watchers_count, repo.open_issues_count, repo.pushed_at || null,
        repo.created_at_github || null, repo.updated_at_github || null,
        repo.priority_score || 0, repo.health_score || 0, repo.status || 'active'
      )
    } catch (error) {
      console.error('Error upserting repository:', error)
      return null
    }
  })

  // Create session
  ipcMain.handle('db:createSession', async (_event, session: {
    id: string
    user_id: number
    expires_at: string
  }) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, ?)
        RETURNING *
      `)
      return stmt.get(session.id, session.user_id, session.expires_at)
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  })

  // Get session
  ipcMain.handle('db:getSession', async (_event, sessionId: string) => {
    try {
      const stmt = db.prepare(`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
      `)
      return stmt.get(sessionId)
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  })

  // Delete session
  ipcMain.handle('db:deleteSession', async (_event, sessionId: string) => {
    try {
      const stmt = db.prepare('DELETE FROM sessions WHERE id = ?')
      stmt.run(sessionId)
      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      return false
    }
  })

  // Generic query handler for more complex operations
  ipcMain.handle('db:query', async (_event, sql: string, params: unknown[] = []) => {
    try {
      const stmt = db.prepare(sql)
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        return stmt.all(...params)
      } else {
        return stmt.run(...params)
      }
    } catch (error) {
      console.error('Error executing query:', error)
      return null
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  await setupApp()
  createWindow()

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
