import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Repository } from '../types/repository'
import { dbRowToRepository } from '../types/repository'
import styles from './RepositoryDetail.module.css'

export function RepositoryDetail() {
  const { id } = useParams<{ id: string }>()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRepository()
  }, [id])

  const loadRepository = async () => {
    if (!id || !window.electronAPI) return

    try {
      const row = await window.electronAPI.db.getRepositoryById(parseInt(id))
      if (row) {
        setRepository(dbRowToRepository(row as Parameters<typeof dbRowToRepository>[0]))
      }
    } catch (error) {
      console.error('Failed to load repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading repository...</div>
  }

  if (!repository) {
    return (
      <div className={styles.notFound}>
        <h2>Repository not found</h2>
        <Link to="/repositories">Back to repositories</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Link to="/repositories" className={styles.backLink}>
        &larr; Back to repositories
      </Link>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{repository.fullName}</h1>
          <span className={`${styles.status} ${styles[repository.status]}`}>
            {repository.status}
          </span>
        </div>
        {repository.description && (
          <p className={styles.description}>{repository.description}</p>
        )}
        <a
          href={repository.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          View on GitHub &rarr;
        </a>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.starsCount}</div>
          <div className={styles.statLabel}>Stars</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.forksCount}</div>
          <div className={styles.statLabel}>Forks</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.watchersCount}</div>
          <div className={styles.statLabel}>Watchers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.openIssuesCount}</div>
          <div className={styles.statLabel}>Open Issues</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.priorityScore}</div>
          <div className={styles.statLabel}>Priority Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{repository.healthScore}</div>
          <div className={styles.statLabel}>Health Score</div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Details</h3>
          <dl className={styles.infoList}>
            <div className={styles.infoItem}>
              <dt>Language</dt>
              <dd>{repository.language || 'Not specified'}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Visibility</dt>
              <dd>{repository.isPrivate ? 'Private' : 'Public'}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Fork</dt>
              <dd>{repository.isFork ? 'Yes' : 'No'}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Archived</dt>
              <dd>{repository.isArchived ? 'Yes' : 'No'}</dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Template</dt>
              <dd>{repository.isTemplate ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Timeline</h3>
          <dl className={styles.infoList}>
            <div className={styles.infoItem}>
              <dt>Created</dt>
              <dd>
                {repository.createdAtGithub
                  ? new Date(repository.createdAtGithub).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Last Push</dt>
              <dd>
                {repository.pushedAt
                  ? new Date(repository.pushedAt).toLocaleDateString()
                  : 'Never'}
              </dd>
            </div>
            <div className={styles.infoItem}>
              <dt>Last Synced</dt>
              <dd>{new Date(repository.syncedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {repository.topics.length > 0 && (
        <div className={styles.topicsSection}>
          <h3 className={styles.infoTitle}>Topics</h3>
          <div className={styles.topics}>
            {repository.topics.map((topic) => (
              <span key={topic} className={styles.topic}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {repository.homepage && (
        <div className={styles.homepageSection}>
          <h3 className={styles.infoTitle}>Homepage</h3>
          <a
            href={repository.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.homepageLink}
          >
            {repository.homepage}
          </a>
        </div>
      )}
    </div>
  )
}
