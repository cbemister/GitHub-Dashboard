export interface ElectronAPI {
  db: {
    getUsers: () => Promise<DbUser[]>
    getUserById: (id: number) => Promise<DbUser | null>
    getUserByGithubId: (githubId: number) => Promise<DbUser | null>
    upsertUser: (user: {
      github_id: number
      username: string
      avatar_url?: string
      access_token: string
    }) => Promise<DbUser | null>

    getRepositories: (userId: number) => Promise<DbRepository[]>
    getRepositoryById: (id: number) => Promise<DbRepository | null>
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
    }) => Promise<DbRepository | null>

    createSession: (session: {
      id: string
      user_id: number
      expires_at: string
    }) => Promise<DbSession | null>
    getSession: (sessionId: string) => Promise<(DbSession & DbUser) | null>
    deleteSession: (sessionId: string) => Promise<boolean>

    query: (sql: string, params?: unknown[]) => Promise<unknown>
  }

  versions: {
    node: () => string
    chrome: () => string
    electron: () => string
  }
}

export interface DbUser {
  id: number
  github_id: number
  username: string
  avatar_url: string | null
  access_token: string
  created_at: string
  updated_at: string
}

export interface DbRepository {
  id: number
  user_id: number
  github_id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics: string
  is_fork: number
  is_archived: number
  is_template: number
  is_private: number
  stars_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  pushed_at: string | null
  created_at_github: string | null
  updated_at_github: string | null
  priority_score: number
  health_score: number
  status: string
  synced_at: string
  created_at: string
}

export interface DbSession {
  id: string
  user_id: number
  expires_at: string
  created_at: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
