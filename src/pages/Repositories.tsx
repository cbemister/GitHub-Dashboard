import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import type { Repository, RepositoryFilters, RepoStatus } from '../types/repository'
import { dbRowToRepository } from '../types/repository'
import styles from './Repositories.module.css'

export function Repositories() {
  const { user } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<RepositoryFilters>({
    status: 'all',
    language: 'all',
    search: '',
  })

  const languages = [...new Set(repositories.map((r) => r.language).filter(Boolean))]

  useEffect(() => {
    loadRepositories()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [repositories, filters])

  const loadRepositories = async () => {
    if (!user || !window.electronAPI) return

    try {
      const rows = await window.electronAPI.db.getRepositories(user.id)
      const repos = rows.map((row: Parameters<typeof dbRowToRepository>[0]) => dbRowToRepository(row))
      setRepositories(repos)
    } catch (error) {
      console.error('Failed to load repositories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...repositories]

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status)
    }

    if (filters.language && filters.language !== 'all') {
      filtered = filtered.filter((r) => r.language === filters.language)
    }

    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.description?.toLowerCase().includes(search)
      )
    }

    // Sort by priority score by default
    filtered.sort((a, b) => b.priorityScore - a.priorityScore)

    setFilteredRepos(filtered)
  }

  const getStatusColor = (status: RepoStatus) => {
    const colors: Record<RepoStatus, string> = {
      active: styles.statusActive,
      maintained: styles.statusMaintained,
      stale: styles.statusStale,
      abandoned: styles.statusAbandoned,
      archived: styles.statusArchived,
      deprecated: styles.statusDeprecated,
    }
    return colors[status] || ''
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading repositories...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Repositories</h1>
        <span className={styles.count}>{filteredRepos.length} repositories</span>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search repositories..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />
        <select
          value={filters.status || 'all'}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as RepoStatus | 'all' })}
          className={styles.select}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="maintained">Maintained</option>
          <option value="stale">Stale</option>
          <option value="abandoned">Abandoned</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filters.language || 'all'}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          className={styles.select}
        >
          <option value="all">All languages</option>
          {languages.map((lang) => (
            <option key={lang} value={lang!}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {filteredRepos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No repositories found.</p>
          {repositories.length === 0 && (
            <p>Sync your repositories from the Dashboard to get started.</p>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRepos.map((repo) => (
            <Link
              key={repo.id}
              to={`/repositories/${repo.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.repoName}>{repo.name}</h3>
                <span className={`${styles.status} ${getStatusColor(repo.status)}`}>
                  {repo.status}
                </span>
              </div>
              {repo.description && (
                <p className={styles.description}>{repo.description}</p>
              )}
              <div className={styles.meta}>
                {repo.language && (
                  <span className={styles.language}>
                    <span
                      className={styles.languageDot}
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    />
                    {repo.language}
                  </span>
                )}
                <span>{repo.starsCount} stars</span>
                <span>{repo.forksCount} forks</span>
                <span>{repo.openIssuesCount} issues</span>
              </div>
              <div className={styles.scores}>
                <div className={styles.score}>
                  <span className={styles.scoreLabel}>Priority</span>
                  <span className={styles.scoreValue}>{repo.priorityScore}</span>
                </div>
                <div className={styles.score}>
                  <span className={styles.scoreLabel}>Health</span>
                  <span className={styles.scoreValue}>{repo.healthScore}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#239120',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Scala: '#c22d40',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Vue: '#41b883',
  }
  return colors[language] || '#8b949e'
}
