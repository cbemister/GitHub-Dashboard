import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { Octokit } from '@octokit/rest'
import styles from './Issues.module.css'

interface Issue {
  id: number
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  updated_at: string
  labels: { name: string; color: string }[]
  repository: {
    name: string
    full_name: string
  }
  user: {
    login: string
    avatar_url: string
  }
}

export function Issues() {
  const { user } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'created' | 'assigned'>('all')

  useEffect(() => {
    loadIssues()
  }, [user, filter])

  const loadIssues = async () => {
    if (!user || !window.electronAPI) return

    setIsLoading(true)
    try {
      const dbUser = await window.electronAPI.db.getUserById(user.id)
      if (!dbUser) return

      const octokit = new Octokit({ auth: dbUser.access_token })

      let response
      if (filter === 'created') {
        response = await octokit.issues.list({
          filter: 'created',
          state: 'open',
          per_page: 50,
          sort: 'updated',
        })
      } else if (filter === 'assigned') {
        response = await octokit.issues.list({
          filter: 'assigned',
          state: 'open',
          per_page: 50,
          sort: 'updated',
        })
      } else {
        response = await octokit.issues.list({
          filter: 'all',
          state: 'open',
          per_page: 50,
          sort: 'updated',
        })
      }

      // Filter out pull requests (they also come from issues API)
      const filteredIssues = response.data
        .filter((issue) => !issue.pull_request)
        .map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          state: issue.state as 'open' | 'closed',
          html_url: issue.html_url,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          labels: issue.labels.map((label) =>
            typeof label === 'string'
              ? { name: label, color: '888888' }
              : { name: label.name || '', color: label.color || '888888' }
          ),
          repository: {
            name: issue.repository?.name || 'Unknown',
            full_name: issue.repository?.full_name || 'Unknown',
          },
          user: {
            login: issue.user?.login || 'Unknown',
            avatar_url: issue.user?.avatar_url || '',
          },
        }))

      setIssues(filteredIssues)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading issues...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Issues</h1>
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'created' ? styles.active : ''}`}
            onClick={() => setFilter('created')}
          >
            Created by me
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'assigned' ? styles.active : ''}`}
            onClick={() => setFilter('assigned')}
          >
            Assigned to me
          </button>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No open issues found.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {issues.map((issue) => (
            <a
              key={issue.id}
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={styles.repoName}>{issue.repository.full_name}</span>
                <span className={styles.issueNumber}>#{issue.number}</span>
              </div>
              <h3 className={styles.issueTitle}>{issue.title}</h3>
              {issue.labels.length > 0 && (
                <div className={styles.labels}>
                  {issue.labels.map((label) => (
                    <span
                      key={label.name}
                      className={styles.label}
                      style={{ backgroundColor: `#${label.color}` }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
              <div className={styles.meta}>
                <span>Opened {formatDate(issue.created_at)}</span>
                <span>by {issue.user.login}</span>
                <span>Updated {formatDate(issue.updated_at)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
