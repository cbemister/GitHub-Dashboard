import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { Octokit } from '@octokit/rest'
import type { Repository, DashboardStats } from '../types/repository'
import { dbRowToRepository } from '../types/repository'
import styles from './Dashboard.module.css'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRepos, setRecentRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user || !window.electronAPI) return

    try {
      const rows = await window.electronAPI.db.getRepositories(user.id)
      const repos = rows.map((row: Parameters<typeof dbRowToRepository>[0]) => dbRowToRepository(row))

      // Calculate stats
      const calculatedStats: DashboardStats = {
        totalRepos: repos.length,
        activeRepos: repos.filter((r) => r.status === 'active').length,
        maintainedRepos: repos.filter((r) => r.status === 'maintained').length,
        staleRepos: repos.filter((r) => r.status === 'stale').length,
        abandonedRepos: repos.filter((r) => r.status === 'abandoned').length,
        archivedRepos: repos.filter((r) => r.isArchived).length,
        publicRepos: repos.filter((r) => !r.isPrivate).length,
        privateRepos: repos.filter((r) => r.isPrivate).length,
        forkedRepos: repos.filter((r) => r.isFork).length,
        totalStars: repos.reduce((sum, r) => sum + r.starsCount, 0),
        totalForks: repos.reduce((sum, r) => sum + r.forksCount, 0),
        totalOpenIssues: repos.reduce((sum, r) => sum + r.openIssuesCount, 0),
      }

      setStats(calculatedStats)

      // Get recent repos (sorted by pushed_at)
      const sorted = [...repos].sort((a, b) => {
        const dateA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0
        const dateB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0
        return dateB - dateA
      })
      setRecentRepos(sorted.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncRepositories = async () => {
    if (!user || !window.electronAPI) return

    setIsSyncing(true)
    try {
      // Get user's access token
      const dbUser = await window.electronAPI.db.getUserById(user.id)
      if (!dbUser) return

      const octokit = new Octokit({ auth: dbUser.access_token })

      // Fetch all repos from GitHub
      const { data: githubRepos } = await octokit.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: 'pushed',
      })

      // Sync each repo to the database
      for (const repo of githubRepos) {
        const status = calculateStatus(repo.pushed_at)

        await window.electronAPI.db.upsertRepository({
          user_id: user.id,
          github_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description || undefined,
          html_url: repo.html_url,
          homepage: repo.homepage || undefined,
          language: repo.language || undefined,
          topics: repo.topics || [],
          is_fork: repo.fork,
          is_archived: repo.archived,
          is_template: repo.is_template || false,
          is_private: repo.private,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          watchers_count: repo.watchers_count,
          open_issues_count: repo.open_issues_count,
          pushed_at: repo.pushed_at || undefined,
          created_at_github: repo.created_at || undefined,
          updated_at_github: repo.updated_at || undefined,
          priority_score: calculatePriorityScore(repo),
          health_score: calculateHealthScore(repo),
          status,
        })
      }

      // Reload data
      await loadData()
    } catch (error) {
      console.error('Failed to sync repositories:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const calculateStatus = (pushedAt: string | null | undefined): string => {
    if (!pushedAt) return 'abandoned'
    const daysSinceLastPush = Math.floor(
      (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastPush <= 7) return 'active'
    if (daysSinceLastPush <= 30) return 'maintained'
    if (daysSinceLastPush <= 90) return 'stale'
    return 'abandoned'
  }

  const calculatePriorityScore = (repo: { stargazers_count: number; forks_count: number; open_issues_count: number; fork: boolean; pushed_at: string | null | undefined }): number => {
    let score = 50

    // Activity bonus
    const status = calculateStatus(repo.pushed_at)
    if (status === 'active') score += 30
    else if (status === 'maintained') score += 20
    else if (status === 'stale') score += 5

    // Popularity bonus
    score += Math.min(repo.stargazers_count * 2, 20)
    score += Math.min(repo.forks_count, 10)

    // Penalty for being a fork
    if (repo.fork) score -= 20

    return Math.max(0, Math.min(100, score))
  }

  const calculateHealthScore = (repo: { open_issues_count: number; archived: boolean; stargazers_count: number; pushed_at: string | null | undefined }): number => {
    let score = 100

    // Deduct for open issues
    score -= Math.min(repo.open_issues_count * 2, 30)

    // Deduct for being archived
    if (repo.archived) score -= 20

    // Deduct for staleness
    const status = calculateStatus(repo.pushed_at)
    if (status === 'stale') score -= 20
    else if (status === 'abandoned') score -= 40

    // Bonus for popularity
    if (repo.stargazers_count >= 10) score += 10

    return Math.max(0, Math.min(100, score))
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <button
          onClick={syncRepositories}
          className={styles.syncButton}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Sync Repositories'}
        </button>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalRepos}</div>
            <div className={styles.statLabel}>Total Repositories</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.activeRepos}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.staleRepos}</div>
            <div className={styles.statLabel}>Stale</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalStars}</div>
            <div className={styles.statLabel}>Total Stars</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalOpenIssues}</div>
            <div className={styles.statLabel}>Open Issues</div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        {recentRepos.length === 0 ? (
          <p className={styles.emptyState}>
            No repositories yet. Click "Sync Repositories" to get started.
          </p>
        ) : (
          <div className={styles.repoList}>
            {recentRepos.map((repo) => (
              <div key={repo.id} className={styles.repoCard}>
                <div className={styles.repoHeader}>
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.repoName}
                  >
                    {repo.name}
                  </a>
                  <span className={`${styles.status} ${styles[repo.status]}`}>
                    {repo.status}
                  </span>
                </div>
                {repo.description && (
                  <p className={styles.repoDescription}>{repo.description}</p>
                )}
                <div className={styles.repoMeta}>
                  {repo.language && <span>{repo.language}</span>}
                  <span>{repo.starsCount} stars</span>
                  <span>{repo.openIssuesCount} issues</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
