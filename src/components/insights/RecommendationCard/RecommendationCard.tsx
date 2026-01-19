"use client";

import Link from "next/link";
import { RepoStatusBadge } from "@/components/repositories/RepoStatusBadge";
import type { Repository, RepoStatus } from "@/lib/db/schema";
import styles from "./RecommendationCard.module.css";

type RecommendationAction = "archive" | "delete" | "review";

interface RecommendationCardProps {
  repository: Repository;
  action: RecommendationAction;
  confidence: number;
  reasons: string[];
  onDismiss?: () => void;
}

const actionLabels: Record<RecommendationAction, string> = {
  archive: "Archive",
  delete: "Delete",
  review: "Review",
};

const actionDescriptions: Record<RecommendationAction, string> = {
  archive: "This repository can be archived to reduce clutter",
  delete: "This repository can be safely deleted",
  review: "This repository needs your attention",
};

export function RecommendationCard({
  repository,
  action,
  confidence,
  reasons,
  onDismiss,
}: RecommendationCardProps) {
  return (
    <div className={`${styles.card} ${styles[action]}`}>
      <div className={styles.header}>
        <div className={styles.actionBadge}>
          {action === "archive" && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v1.5A1.75 1.75 0 0 1 14.25 6H1.75A1.75 1.75 0 0 1 0 4.25ZM1.75 7a.75.75 0 0 1 .75.75v5.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-5.5a.75.75 0 0 1 1.5 0v5.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25v-5.5A.75.75 0 0 1 1.75 7Zm4.5.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5Z" />
            </svg>
          )}
          {action === "delete" && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
            </svg>
          )}
          {action === "review" && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
            </svg>
          )}
          {actionLabels[action]}
        </div>
        <div className={styles.confidence}>
          {confidence}% confidence
        </div>
      </div>

      <div className={styles.repoInfo}>
        <div className={styles.repoHeader}>
          <a
            href={repository.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoName}
          >
            {repository.name}
          </a>
          <RepoStatusBadge status={repository.status as RepoStatus} />
        </div>
        {repository.description && (
          <p className={styles.description}>{repository.description}</p>
        )}
      </div>

      <div className={styles.reasons}>
        <h4 className={styles.reasonsTitle}>Why?</h4>
        <ul className={styles.reasonsList}>
          {reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Link
          href={`/repositories/${repository.id}`}
          className={styles.viewButton}
        >
          View Details
        </Link>
        <a
          href={repository.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubButton}
        >
          Open on GitHub
        </a>
        {onDismiss && (
          <button onClick={onDismiss} className={styles.dismissButton}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
