import Link from "next/link";
import { RepoStatusBadge } from "../RepoStatusBadge";
import type { Repository } from "@/lib/db/schema";
import styles from "./RepoCard.module.css";

interface RepoCardProps {
  repository: Repository;
}

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export function RepoCard({ repository }: RepoCardProps) {
  const {
    id,
    name,
    fullName,
    description,
    htmlUrl,
    isPrivate,
    isFork,
    isArchived,
    language,
    stargazersCount,
    forksCount,
    openIssuesCount,
    status,
    priorityScore,
    pushedAt,
  } = repository;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.name}
          >
            {name}
          </a>
          <div className={styles.badges}>
            {isPrivate && <span className={styles.visibilityBadge}>Private</span>}
            {isFork && <span className={styles.forkBadge}>Fork</span>}
            <RepoStatusBadge status={status!} />
          </div>
        </div>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      <div className={styles.meta}>
        {language && (
          <span className={styles.metaItem}>
            <span className={styles.languageDot} />
            {language}
          </span>
        )}
        {(stargazersCount ?? 0) > 0 && (
          <span className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {stargazersCount}
          </span>
        )}
        {(forksCount ?? 0) > 0 && (
          <span className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
            </svg>
            {forksCount}
          </span>
        )}
        {(openIssuesCount ?? 0) > 0 && (
          <span className={`${styles.metaItem} ${styles.issues}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
            </svg>
            {openIssuesCount} issues
          </span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.updated}>
          Updated {formatRelativeTime(pushedAt)}
        </span>
        <div className={styles.footerRight}>
          <span className={styles.priority}>
            Priority: {priorityScore}
          </span>
          <Link href={`/repositories/${id}`} className={styles.viewLink}>
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
