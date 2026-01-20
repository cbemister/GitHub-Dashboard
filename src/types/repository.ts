export type RepoStatus =
  | 'active'
  | 'maintained'
  | 'stale'
  | 'abandoned'
  | 'archived'
  | 'deprecated'

export interface Repository {
  id: number
  userId: number
  githubId: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  language: string | null
  topics: string[]
  isFork: boolean
  isArchived: boolean
  isTemplate: boolean
  isPrivate: boolean
  starsCount: number
  forksCount: number
  watchersCount: number
  openIssuesCount: number
  pushedAt: string | null
  createdAtGithub: string | null
  updatedAtGithub: string | null
  priorityScore: number
  healthScore: number
  status: RepoStatus
  syncedAt: string
  createdAt: string
}

export interface RepositoryWithStats extends Repository {
  daysSinceLastPush: number
  daysSinceLastUpdate: number
}

export interface RepositoryFilters {
  status?: RepoStatus | 'all'
  language?: string | 'all'
  visibility?: 'all' | 'public' | 'private'
  search?: string
  hasIssues?: boolean
  isFork?: boolean
}

export type SortField =
  | 'priorityScore'
  | 'starsCount'
  | 'pushedAt'
  | 'name'
  | 'openIssuesCount'

export type SortDirection = 'asc' | 'desc'

export interface RepositorySort {
  field: SortField
  direction: SortDirection
}

export interface Recommendation {
  repositoryId: number
  action: 'archive' | 'delete' | 'review' | 'keep'
  confidence: number
  reasons: string[]
}

export interface DashboardStats {
  totalRepos: number
  activeRepos: number
  maintainedRepos: number
  staleRepos: number
  abandonedRepos: number
  archivedRepos: number
  publicRepos: number
  privateRepos: number
  forkedRepos: number
  totalStars: number
  totalForks: number
  totalOpenIssues: number
}

export interface StatusDistribution {
  status: RepoStatus
  count: number
  percentage: number
}

// Helper to convert DB row to Repository type
export function dbRowToRepository(row: {
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
}): Repository {
  return {
    id: row.id,
    userId: row.user_id,
    githubId: row.github_id,
    name: row.name,
    fullName: row.full_name,
    description: row.description,
    htmlUrl: row.html_url,
    homepage: row.homepage,
    language: row.language,
    topics: JSON.parse(row.topics || '[]'),
    isFork: row.is_fork === 1,
    isArchived: row.is_archived === 1,
    isTemplate: row.is_template === 1,
    isPrivate: row.is_private === 1,
    starsCount: row.stars_count,
    forksCount: row.forks_count,
    watchersCount: row.watchers_count,
    openIssuesCount: row.open_issues_count,
    pushedAt: row.pushed_at,
    createdAtGithub: row.created_at_github,
    updatedAtGithub: row.updated_at_github,
    priorityScore: row.priority_score,
    healthScore: row.health_score,
    status: row.status as RepoStatus,
    syncedAt: row.synced_at,
    createdAt: row.created_at,
  }
}
