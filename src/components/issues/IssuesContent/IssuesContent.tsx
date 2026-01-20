"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./IssuesContent.module.css";

interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  user: {
    login: string;
    avatarUrl: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: number;
  isPullRequest: boolean;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  openIssuesCount: number;
  issues: Issue[];
}

interface IssuesData {
  repositories: Repository[];
  totalIssues: number;
  totalRepositories: number;
}

export function IssuesContent() {
  const [data, setData] = useState<IssuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRepos, setExpandedRepos] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchIssues() {
      try {
        setLoading(true);
        const response = await fetch("/api/issues");

        if (!response.ok) {
          throw new Error("Failed to fetch issues");
        }

        const data = await response.json();
        setData(data);
        
        // Auto-expand first repo if there are any
        if (data.repositories.length > 0) {
          setExpandedRepos(new Set([data.repositories[0].id]));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, []);

  function toggleRepo(repoId: number) {
    setExpandedRepos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  }

  function expandAll() {
    setExpandedRepos(new Set(data?.repositories.map((r) => r.id) || []));
  }

  function collapseAll() {
    setExpandedRepos(new Set());
  }

  function formatRelativeTime(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Issues</h1>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading issues from all repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Issues</h1>
        </div>
        <div className={styles.error}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.repositories.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Issues</h1>
        </div>
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
          </svg>
          <h2>No Open Issues</h2>
          <p>None of your repositories have open issues.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>All Issues</h1>
          <p className={styles.subtitle}>
            {data.totalIssues} open {data.totalIssues === 1 ? "issue" : "issues"} across {data.totalRepositories} {data.totalRepositories === 1 ? "repository" : "repositories"}
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={expandAll} className={styles.actionButton}>
            Expand All
          </button>
          <button onClick={collapseAll} className={styles.actionButton}>
            Collapse All
          </button>
        </div>
      </div>

      <div className={styles.repositories}>
        {data.repositories.map((repo) => {
          const isExpanded = expandedRepos.has(repo.id);

          return (
            <div key={repo.id} className={styles.repoSection}>
              <button
                className={styles.repoHeader}
                onClick={() => toggleRepo(repo.id)}
              >
                <div className={styles.repoHeaderLeft}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ""}`}
                  >
                    <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                  </svg>
                  <span className={styles.repoName}>{repo.name}</span>
                  <span className={styles.issueCount}>
                    {repo.openIssuesCount} {repo.openIssuesCount === 1 ? "issue" : "issues"}
                  </span>
                </div>
                <div className={styles.repoHeaderRight}>
                  <Link
                    href={`/repositories/${repo.id}`}
                    className={styles.repoLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>
              </button>

              {isExpanded && (
                <div className={styles.issuesContainer}>
                  {repo.issues.length === 0 ? (
                    <div className={styles.noIssues}>
                      <p>Unable to load issues for this repository.</p>
                    </div>
                  ) : (
                    <ul className={styles.issuesList}>
                      {repo.issues.map((issue) => (
                        <li key={issue.id} className={styles.issueItem}>
                          <div className={styles.issueIcon}>
                            {issue.isPullRequest ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                              </svg>
                            )}
                          </div>

                          <div className={styles.issueContent}>
                            <div className={styles.issueTitle}>
                              <a
                                href={issue.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.issueLink}
                              >
                                {issue.title}
                              </a>
                            </div>

                            <div className={styles.issueMeta}>
                              <span>#{issue.number}</span>
                              <span>opened {formatRelativeTime(issue.createdAt)}</span>
                              <span>by {issue.user.login}</span>
                              {issue.comments > 0 && (
                                <span className={styles.comments}>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
                                  </svg>
                                  {issue.comments}
                                </span>
                              )}
                            </div>

                            {issue.labels.length > 0 && (
                              <div className={styles.labels}>
                                {issue.labels.slice(0, 3).map((label) => (
                                  <span
                                    key={label.name}
                                    className={styles.label}
                                    style={{
                                      backgroundColor: `#${label.color}20`,
                                      borderColor: `#${label.color}`,
                                      color: `#${label.color}`,
                                    }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                                {issue.labels.length > 3 && (
                                  <span className={styles.labelMore}>
                                    +{issue.labels.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
