import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import type { Repository } from '../types/repository'
import { dbRowToRepository } from '../types/repository'
import styles from './Analysis.module.css'

interface LanguageStats {
  language: string
  count: number
  percentage: number
}

interface StatusStats {
  status: string
  count: number
  percentage: number
}

export function Analysis() {
  const { user } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([])
  const [statusStats, setStatusStats] = useState<StatusStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user || !window.electronAPI) return

    try {
      const rows = await window.electronAPI.db.getRepositories(user.id)
      const repos = rows.map((row: Parameters<typeof dbRowToRepository>[0]) => dbRowToRepository(row))
      setRepositories(repos)

      // Calculate language stats
      const languageCounts: Record<string, number> = {}
      repos.forEach((repo) => {
        const lang = repo.language || 'Unknown'
        languageCounts[lang] = (languageCounts[lang] || 0) + 1
      })

      const langStats = Object.entries(languageCounts)
        .map(([language, count]) => ({
          language,
          count,
          percentage: (count / repos.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)

      setLanguageStats(langStats)

      // Calculate status stats
      const statusCounts: Record<string, number> = {}
      repos.forEach((repo) => {
        statusCounts[repo.status] = (statusCounts[repo.status] || 0) + 1
      })

      const statStats = Object.entries(statusCounts)
        .map(([status, count]) => ({
          status,
          count,
          percentage: (count / repos.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)

      setStatusStats(statStats)
    } catch (error) {
      console.error('Failed to load analysis data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'var(--color-status-active)',
      maintained: 'var(--color-status-maintained)',
      stale: 'var(--color-status-stale)',
      abandoned: 'var(--color-status-abandoned)',
      archived: 'var(--color-status-archived)',
      deprecated: 'var(--color-status-deprecated)',
    }
    return colors[status] || 'var(--color-foreground-muted)'
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading analysis...</div>
  }

  const totalStars = repositories.reduce((sum, r) => sum + r.starsCount, 0)
  const totalForks = repositories.reduce((sum, r) => sum + r.forksCount, 0)
  const avgPriority = repositories.length
    ? Math.round(repositories.reduce((sum, r) => sum + r.priorityScore, 0) / repositories.length)
    : 0
  const avgHealth = repositories.length
    ? Math.round(repositories.reduce((sum, r) => sum + r.healthScore, 0) / repositories.length)
    : 0

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analysis</h1>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{repositories.length}</div>
          <div className={styles.summaryLabel}>Total Repositories</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{totalStars}</div>
          <div className={styles.summaryLabel}>Total Stars</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{totalForks}</div>
          <div className={styles.summaryLabel}>Total Forks</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{avgPriority}</div>
          <div className={styles.summaryLabel}>Avg Priority Score</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{avgHealth}</div>
          <div className={styles.summaryLabel}>Avg Health Score</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Languages</h2>
          {languageStats.length === 0 ? (
            <p className={styles.emptyState}>No language data available</p>
          ) : (
            <div className={styles.barChart}>
              {languageStats.slice(0, 10).map((stat) => (
                <div key={stat.language} className={styles.barItem}>
                  <div className={styles.barLabel}>{stat.language}</div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className={styles.barValue}>
                    {stat.count} ({stat.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Status Distribution</h2>
          {statusStats.length === 0 ? (
            <p className={styles.emptyState}>No status data available</p>
          ) : (
            <div className={styles.barChart}>
              {statusStats.map((stat) => (
                <div key={stat.status} className={styles.barItem}>
                  <div className={styles.barLabel} style={{ textTransform: 'capitalize' }}>
                    {stat.status}
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: getStatusColor(stat.status),
                      }}
                    />
                  </div>
                  <div className={styles.barValue}>
                    {stat.count} ({stat.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.topReposSection}>
        <h2 className={styles.chartTitle}>Top Repositories by Stars</h2>
        <div className={styles.topReposList}>
          {repositories
            .sort((a, b) => b.starsCount - a.starsCount)
            .slice(0, 5)
            .map((repo) => (
              <div key={repo.id} className={styles.topRepoItem}>
                <div className={styles.topRepoName}>{repo.name}</div>
                <div className={styles.topRepoStats}>
                  <span>{repo.starsCount} stars</span>
                  <span>{repo.language || 'Unknown'}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
