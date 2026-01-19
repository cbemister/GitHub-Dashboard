"use client";

import { useState, useMemo } from "react";
import styles from "./FeatureAuditTable.module.css";

interface RepoFeature {
  repoId: number;
  repoName: string;
  fullName: string;
  language: string | null;
  hasIssues: boolean;
  hasWiki: boolean;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  hasTopics: boolean;
  hasDescription: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  status: string;
  healthScore: number;
  priorityScore: number;
}

interface FeatureAuditTableProps {
  features: RepoFeature[];
}

type SortField = "repoName" | "language" | "stars" | "healthScore" | "status";
type SortDirection = "asc" | "desc";

export function FeatureAuditTable({ features }: FeatureAuditTableProps) {
  const [sortField, setSortField] = useState<SortField>("healthScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...features];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.repoName.toLowerCase().includes(query) ||
          (f.language?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "repoName":
          comparison = a.repoName.localeCompare(b.repoName);
          break;
        case "language":
          comparison = (a.language || "").localeCompare(b.language || "");
          break;
        case "stars":
          comparison = a.stars - b.stars;
          break;
        case "healthScore":
          comparison = a.healthScore - b.healthScore;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [features, searchQuery, sortField, sortDirection]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "maintained":
        return styles.statusMaintained;
      case "stale":
        return styles.statusStale;
      case "abandoned":
        return styles.statusAbandoned;
      case "archived":
        return styles.statusArchived;
      default:
        return "";
    }
  };

  const getHealthClass = (score: number) => {
    if (score >= 80) return styles.healthGood;
    if (score >= 50) return styles.healthMedium;
    return styles.healthLow;
  };

  if (features.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No repository data available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.search}
        />
        <span className={styles.resultCount}>
          {filteredAndSorted.length} of {features.length} repos
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.sortable}
                onClick={() => handleSort("repoName")}
              >
                Repository
                {sortField === "repoName" && (
                  <span className={styles.sortIcon}>
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </th>
              <th
                className={styles.sortable}
                onClick={() => handleSort("language")}
              >
                Language
                {sortField === "language" && (
                  <span className={styles.sortIcon}>
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </th>
              <th
                className={`${styles.sortable} ${styles.center}`}
                onClick={() => handleSort("stars")}
              >
                Stars
                {sortField === "stars" && (
                  <span className={styles.sortIcon}>
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </th>
              <th className={styles.center}>Features</th>
              <th
                className={`${styles.sortable} ${styles.center}`}
                onClick={() => handleSort("status")}
              >
                Status
                {sortField === "status" && (
                  <span className={styles.sortIcon}>
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </th>
              <th
                className={`${styles.sortable} ${styles.center}`}
                onClick={() => handleSort("healthScore")}
              >
                Health
                {sortField === "healthScore" && (
                  <span className={styles.sortIcon}>
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.slice(0, 50).map((repo) => (
              <tr key={repo.repoId}>
                <td>
                  <div className={styles.repoCell}>
                    <span className={styles.repoName}>{repo.repoName}</span>
                    <div className={styles.flags}>
                      {repo.isPrivate && (
                        <span className={styles.flag} title="Private">
                          P
                        </span>
                      )}
                      {repo.isFork && (
                        <span className={styles.flag} title="Fork">
                          F
                        </span>
                      )}
                      {repo.isTemplate && (
                        <span className={styles.flag} title="Template">
                          T
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.language}>
                    {repo.language || "—"}
                  </span>
                </td>
                <td className={styles.center}>
                  <span className={styles.stat}>{repo.stars}</span>
                </td>
                <td className={styles.center}>
                  <div className={styles.features}>
                    <span
                      className={`${styles.featureDot} ${repo.hasDescription ? styles.on : styles.off}`}
                      title={repo.hasDescription ? "Has description" : "No description"}
                    />
                    <span
                      className={`${styles.featureDot} ${repo.hasTopics ? styles.on : styles.off}`}
                      title={repo.hasTopics ? "Has topics" : "No topics"}
                    />
                    <span
                      className={`${styles.featureDot} ${repo.hasIssues ? styles.on : styles.off}`}
                      title={repo.hasIssues ? "Has open issues" : "No open issues"}
                    />
                  </div>
                </td>
                <td className={styles.center}>
                  <span className={`${styles.status} ${getStatusClass(repo.status)}`}>
                    {repo.status}
                  </span>
                </td>
                <td className={styles.center}>
                  <span className={`${styles.health} ${getHealthClass(repo.healthScore)}`}>
                    {repo.healthScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length > 50 && (
        <p className={styles.moreText}>
          Showing 50 of {filteredAndSorted.length} repositories
        </p>
      )}

      <div className={styles.legend}>
        <span className={styles.legendTitle}>Features Legend:</span>
        <span className={styles.legendItem}>
          <span className={`${styles.featureDot} ${styles.on}`} /> Description
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.featureDot} ${styles.on}`} /> Topics
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.featureDot} ${styles.on}`} /> Open Issues
        </span>
      </div>
    </div>
  );
}
