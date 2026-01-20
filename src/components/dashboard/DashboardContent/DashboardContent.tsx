"use client";

import { useStats } from "@/hooks/useStats";
import { SyncButton } from "@/components/dashboard/SyncButton";
import Link from "next/link";
import styles from "./DashboardContent.module.css";

interface DashboardContentProps {
  username: string;
}

export function DashboardContent({ username }: DashboardContentProps) {
  const { data, isLoading, refetch } = useStats();

  const stats = data?.stats;
  const hasRepos = stats && stats.totalRepos > 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {username}</h1>
          <p className={styles.subtitle}>
            {hasRepos
              ? "Here's an overview of your GitHub repositories"
              : "Sync your repositories to get started"}
          </p>
        </div>
        <div className={styles.headerActions}>
          <SyncButton onSyncComplete={refetch} />
          {stats?.lastSyncAt && (
            <span className={styles.lastSync}>
              Last synced: {formatDate(stats.lastSyncAt)}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonNumber} />
            </div>
          ))}
        </div>
      ) : hasRepos ? (
        <>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Total Repositories</h2>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.statNumber}>{stats.totalRepos}</span>
                <span className={styles.statLabel}>
                  {stats.publicRepos} public, {stats.privateRepos} private
                </span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Active</h2>
              </div>
              <div className={styles.cardContent}>
                <span className={`${styles.statNumber} ${styles.statActive}`}>
                  {stats.activeRepos}
                </span>
                <span className={styles.statLabel}>Updated in last 7 days</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Stale</h2>
              </div>
              <div className={styles.cardContent}>
                <span className={`${styles.statNumber} ${styles.statStale}`}>
                  {stats.staleRepos}
                </span>
                <span className={styles.statLabel}>No updates in 30-90 days</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Abandoned</h2>
              </div>
              <div className={styles.cardContent}>
                <span className={`${styles.statNumber} ${styles.statAbandoned}`}>
                  {stats.abandonedRepos}
                </span>
                <span className={styles.statLabel}>No updates in 90+ days</span>
              </div>
            </div>
          </div>

          <div className={styles.sections}>
            <div className={styles.sectionWide}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Active Projects</h2>
                <Link href="/repositories?status=active" className={styles.sectionLink}>
                  View all
                </Link>
              </div>
              <div className={styles.sectionContent}>
                {data?.activeProjects?.length ? (
                  <div className={styles.projectGrid}>
                    {data.activeProjects.map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.projectCard}
                      >
                        <div className={styles.projectHeader}>
                          <span className={styles.projectName}>{repo.name}</span>
                          {repo.language && (
                            <span className={styles.projectLang}>{repo.language}</span>
                          )}
                        </div>
                        {repo.description && (
                          <p className={styles.projectDesc}>{repo.description}</p>
                        )}
                        <div className={styles.projectMeta}>
                          <span className={`${styles.statusDot} ${styles[`dot${repo.status.charAt(0).toUpperCase() + repo.status.slice(1)}`]}`} />
                          <span className={styles.projectDate}>
                            {repo.pushedAt
                              ? `Updated ${formatDate(repo.pushedAt)}`
                              : "No recent activity"}
                          </span>
                          {(repo.stargazersCount ?? 0) > 0 && (
                            <span className={styles.projectStars}>
                              {repo.stargazersCount}
                            </span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No active projects yet</p>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Status Distribution</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.statusBars}>
                  {data?.statusDistribution.map((item) => (
                    <div key={item.status} className={styles.statusBar}>
                      <div className={styles.statusBarLabel}>
                        <span className={styles.statusName}>{item.status}</span>
                        <span className={styles.statusCount}>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className={styles.statusBarTrack}>
                        <div
                          className={`${styles.statusBarFill} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Top Priority</h2>
                <Link href="/repositories?sortBy=priorityScore" className={styles.sectionLink}>
                  View all
                </Link>
              </div>
              <div className={styles.sectionContent}>
                {data?.topPriorityRepos.length ? (
                  <ul className={styles.priorityList}>
                    {data.topPriorityRepos.map((repo) => (
                      <li key={repo.id} className={styles.priorityItem}>
                        <div className={styles.priorityInfo}>
                          <a
                            href={`https://github.com/${repo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.repoName}
                          >
                            {repo.name}
                          </a>
                          <span className={`${styles.statusBadge} ${styles[`badge${repo.status.charAt(0).toUpperCase() + repo.status.slice(1)}`]}`}>
                            {repo.status}
                          </span>
                        </div>
                        <div className={styles.priorityMeta}>
                          {repo.language && (
                            <span className={styles.language}>{repo.language}</span>
                          )}
                          {repo.openIssuesCount > 0 && (
                            <span className={styles.issues}>
                              {repo.openIssuesCount} issues
                            </span>
                          )}
                          <span className={styles.score}>
                            Priority: {repo.priorityScore}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyText}>No repositories need attention</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.section}>
          <div className={styles.emptyState}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={styles.emptyIcon}
            >
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
            </svg>
            <h3 className={styles.emptyTitle}>No repositories synced yet</h3>
            <p className={styles.emptyDescription}>
              Click &quot;Sync Repositories&quot; above to fetch your GitHub repositories
              and see their status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
