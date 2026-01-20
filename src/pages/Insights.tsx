import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import type { Repository, Recommendation } from '../types/repository'
import { dbRowToRepository } from '../types/repository'
import styles from './Insights.module.css'

export function Insights() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<(Recommendation & { repo: Repository })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateRecommendations()
  }, [user])

  const generateRecommendations = async () => {
    if (!user || !window.electronAPI) return

    try {
      const rows = await window.electronAPI.db.getRepositories(user.id)
      const repos = rows.map((row: Parameters<typeof dbRowToRepository>[0]) => dbRowToRepository(row))

      // Generate recommendations based on repository health
      const recs: (Recommendation & { repo: Repository })[] = []

      repos.forEach((repo) => {
        const reasons: string[] = []
        let action: Recommendation['action'] = 'keep'
        let confidence = 0.5

        // Check for abandoned repositories
        if (repo.status === 'abandoned' && !repo.isArchived) {
          reasons.push('No activity for over 90 days')
          if (repo.starsCount < 5 && repo.forksCount === 0) {
            action = 'archive'
            confidence = 0.8
            reasons.push('Low engagement (< 5 stars, no forks)')
          } else {
            action = 'review'
            confidence = 0.7
            reasons.push('Consider archiving or resuming development')
          }
        }

        // Check for stale repositories
        if (repo.status === 'stale') {
          reasons.push('No activity for 30-90 days')
          action = 'review'
          confidence = 0.6
        }

        // Check for repositories with many open issues
        if (repo.openIssuesCount > 10) {
          reasons.push(`${repo.openIssuesCount} open issues need attention`)
          action = 'review'
          confidence = Math.max(confidence, 0.7)
        }

        // Check for forks that might not be needed
        if (repo.isFork && repo.status === 'abandoned' && repo.starsCount === 0) {
          reasons.push('Inactive fork with no stars')
          action = 'delete'
          confidence = 0.75
        }

        // Only add recommendations for repos that need attention
        if (reasons.length > 0) {
          recs.push({
            repositoryId: repo.id,
            action,
            confidence,
            reasons,
            repo,
          })
        }
      })

      // Sort by confidence (highest first)
      recs.sort((a, b) => b.confidence - a.confidence)

      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActionColor = (action: Recommendation['action']): string => {
    const colors: Record<Recommendation['action'], string> = {
      archive: 'var(--color-warning)',
      delete: 'var(--color-danger)',
      review: 'var(--color-info)',
      keep: 'var(--color-success)',
    }
    return colors[action]
  }

  const getActionLabel = (action: Recommendation['action']): string => {
    const labels: Record<Recommendation['action'], string> = {
      archive: 'Consider Archiving',
      delete: 'Consider Deleting',
      review: 'Needs Review',
      keep: 'Keep',
    }
    return labels[action]
  }

  if (isLoading) {
    return <div className={styles.loading}>Generating insights...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Insights</h1>
        <p className={styles.subtitle}>
          Recommendations for managing your repositories
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>All clear!</h2>
          <p>Your repositories look healthy. No recommendations at this time.</p>
        </div>
      ) : (
        <div className={styles.recommendations}>
          <p className={styles.count}>
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
          </p>

          <div className={styles.list}>
            {recommendations.map((rec) => (
              <div key={rec.repositoryId} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.repoName}>{rec.repo.name}</h3>
                  <span
                    className={styles.actionBadge}
                    style={{ backgroundColor: getActionColor(rec.action) }}
                  >
                    {getActionLabel(rec.action)}
                  </span>
                </div>

                <div className={styles.confidence}>
                  <span>Confidence:</span>
                  <div className={styles.confidenceBar}>
                    <div
                      className={styles.confidenceFill}
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(rec.confidence * 100)}%</span>
                </div>

                <div className={styles.reasons}>
                  <h4>Reasons:</h4>
                  <ul>
                    {rec.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.repoMeta}>
                    <span>{rec.repo.language || 'Unknown'}</span>
                    <span>{rec.repo.starsCount} stars</span>
                    <span>{rec.repo.openIssuesCount} issues</span>
                  </div>
                  <a
                    href={rec.repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLink}
                  >
                    View on GitHub &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
