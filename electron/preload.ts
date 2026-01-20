import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    getUsers: () => ipcRenderer.invoke('db:getUsers'),
    getUserById: (id: number) => ipcRenderer.invoke('db:getUserById', id),
    getUserByGithubId: (githubId: number) => ipcRenderer.invoke('db:getUserByGithubId', githubId),
    upsertUser: (user: {
      github_id: number
      username: string
      avatar_url?: string
      access_token: string
    }) => ipcRenderer.invoke('db:upsertUser', user),

    getRepositories: (userId: number) => ipcRenderer.invoke('db:getRepositories', userId),
    getRepositoryById: (id: number) => ipcRenderer.invoke('db:getRepositoryById', id),
    upsertRepository: (repo: {
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
    }) => ipcRenderer.invoke('db:upsertRepository', repo),

    createSession: (session: { id: string; user_id: number; expires_at: string }) =>
      ipcRenderer.invoke('db:createSession', session),
    getSession: (sessionId: string) => ipcRenderer.invoke('db:getSession', sessionId),
    deleteSession: (sessionId: string) => ipcRenderer.invoke('db:deleteSession', sessionId),

    query: (sql: string, params?: unknown[]) => ipcRenderer.invoke('db:query', sql, params),
  },

  // App info
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
})
