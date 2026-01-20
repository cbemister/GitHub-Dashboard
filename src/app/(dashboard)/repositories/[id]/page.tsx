import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db, repositories } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { RepoStatusBadge } from "@/components/repositories/RepoStatusBadge";
import { IssuesList } from "@/components/repositories/IssuesList";
import Link from "next/link";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;
  const repoId = parseInt(id);

  if (isNaN(repoId)) {
    notFound();
  }

  const repo = await db.query.repositories.findFirst({
    where: and(
      eq(repositories.id, repoId),
      eq(repositories.userId, session.userId)
    ),
  });

  if (!repo) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/repositories" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
          Back to repositories
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{repo.name}</h1>
          <div className={styles.badges}>
            {repo.isPrivate && <span className={styles.badge}>Private</span>}
            {repo.isFork && <span className={styles.badge}>Fork</span>}
            {repo.isArchived && <span className={styles.badge}>Archived</span>}
            <RepoStatusBadge status={repo.status!} size="md" />
          </div>
        </div>
        {repo.description && (
          <p className={styles.description}>{repo.description}</p>
        )}
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
          View on GitHub
        </a>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Statistics</h2>
          <dl className={styles.statsList}>
            <div className={styles.statItem}>
              <dt>Stars</dt>
              <dd>{repo.stargazersCount}</dd>
            </div>
            <div className={styles.statItem}>
              <dt>Forks</dt>
              <dd>{repo.forksCount}</dd>
            </div>
            <div className={styles.statItem}>
              <dt>Watchers</dt>
              <dd>{repo.watchersCount}</dd>
            </div>
            <div className={styles.statItem}>
              <dt>Open Issues</dt>
              <dd className={repo.openIssuesCount! > 0 ? styles.warning : ""}>
                {repo.openIssuesCount}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Scores</h2>
          <dl className={styles.statsList}>
            <div className={styles.statItem}>
              <dt>Priority Score</dt>
              <dd>{repo.priorityScore}/100</dd>
            </div>
            <div className={styles.statItem}>
              <dt>Health Score</dt>
              <dd>{repo.healthScore}/100</dd>
            </div>
          </dl>
          <div className={styles.scoreBar}>
            <div className={styles.scoreLabel}>Priority</div>
            <div className={styles.scoreTrack}>
              <div
                className={styles.scoreFill}
                style={{ width: `${repo.priorityScore}%` }}
              />
            </div>
          </div>
          <div className={styles.scoreBar}>
            <div className={styles.scoreLabel}>Health</div>
            <div className={styles.scoreTrack}>
              <div
                className={`${styles.scoreFill} ${styles.healthFill}`}
                style={{ width: `${repo.healthScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Details</h2>
          <dl className={styles.detailsList}>
            {repo.language && (
              <div className={styles.detailItem}>
                <dt>Language</dt>
                <dd>{repo.language}</dd>
              </div>
            )}
            {repo.topics && repo.topics.length > 0 && (
              <div className={styles.detailItem}>
                <dt>Topics</dt>
                <dd className={styles.topics}>
                  {repo.topics.map((topic) => (
                    <span key={topic} className={styles.topic}>
                      {topic}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Activity</h2>
          <dl className={styles.detailsList}>
            <div className={styles.detailItem}>
              <dt>Last Push</dt>
              <dd>
                {formatRelativeTime(repo.pushedAt)}
                <span className={styles.dateDetail}>
                  {formatDate(repo.pushedAt)}
                </span>
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Created</dt>
              <dd>{formatDate(repo.createdAtGithub)}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Last Synced</dt>
              <dd>{formatDate(repo.lastSyncAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {(repo.openIssuesCount ?? 0) > 0 && (
        <div className={styles.cardFullWidth}>
          <h2 className={styles.cardTitle}>Open Issues</h2>
          <IssuesList repositoryId={repo.id} />
        </div>
      )}
    </div>
  );
}
