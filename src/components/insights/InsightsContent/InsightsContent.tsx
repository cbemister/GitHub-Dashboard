"use client";

import { useState, useEffect, useCallback } from "react";
import { RecommendationCard } from "../RecommendationCard";
import type { Repository } from "@/lib/db/schema";
import styles from "./InsightsContent.module.css";

type RecommendationAction = "archive" | "delete" | "review";

interface Recommendation {
  repositoryId: number;
  repository: Repository;
  action: RecommendationAction;
  confidence: number;
  reasons: string[];
  priority: number;
}

interface RecommendationStats {
  total: number;
  toArchive: number;
  toDelete: number;
  toReview: number;
  toKeep: number;
  actionNeeded: number;
  highConfidence: number;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  stats: RecommendationStats;
  grouped: {
    archive: Recommendation[];
    delete: Recommendation[];
    review: Recommendation[];
  };
}

type FilterType = "all" | "archive" | "delete" | "review";

export function InsightsContent() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/recommendations");

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleDismiss = (repoId: number) => {
    setDismissed((prev) => new Set([...prev, repoId]));
  };

  const getFilteredRecommendations = () => {
    if (!data) return [];

    let recommendations: Recommendation[];
    if (filter === "all") {
      recommendations = data.recommendations;
    } else {
      recommendations = data.grouped[filter] || [];
    }

    return recommendations.filter((r) => !dismissed.has(r.repositoryId));
  };

  const filteredRecommendations = getFilteredRecommendations();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Analyzing your repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchRecommendations} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.stats.actionNeeded === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={styles.emptyIcon}
          >
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z" />
          </svg>
          <h3 className={styles.emptyTitle}>All good!</h3>
          <p className={styles.emptyText}>
            No recommendations at this time. Your repositories look well-maintained.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{data.stats.actionNeeded}</div>
          <div className={styles.statLabel}>Need Attention</div>
        </div>
        <div className={`${styles.statCard} ${styles.archive}`}>
          <div className={styles.statNumber}>{data.stats.toArchive}</div>
          <div className={styles.statLabel}>To Archive</div>
        </div>
        <div className={`${styles.statCard} ${styles.delete}`}>
          <div className={styles.statNumber}>{data.stats.toDelete}</div>
          <div className={styles.statLabel}>To Delete</div>
        </div>
        <div className={`${styles.statCard} ${styles.review}`}>
          <div className={styles.statNumber}>{data.stats.toReview}</div>
          <div className={styles.statLabel}>To Review</div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Show:</span>
        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilter("all")}
            className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
          >
            All ({data.stats.actionNeeded})
          </button>
          <button
            onClick={() => setFilter("archive")}
            className={`${styles.filterButton} ${filter === "archive" ? styles.active : ""}`}
          >
            Archive ({data.stats.toArchive})
          </button>
          <button
            onClick={() => setFilter("delete")}
            className={`${styles.filterButton} ${filter === "delete" ? styles.active : ""}`}
          >
            Delete ({data.stats.toDelete})
          </button>
          <button
            onClick={() => setFilter("review")}
            className={`${styles.filterButton} ${filter === "review" ? styles.active : ""}`}
          >
            Review ({data.stats.toReview})
          </button>
        </div>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className={styles.noResults}>
          <p>No recommendations in this category.</p>
        </div>
      ) : (
        <div className={styles.recommendationsList}>
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.repositoryId}
              repository={rec.repository}
              action={rec.action}
              confidence={rec.confidence}
              reasons={rec.reasons}
              onDismiss={() => handleDismiss(rec.repositoryId)}
            />
          ))}
        </div>
      )}

      {dismissed.size > 0 && (
        <div className={styles.dismissedInfo}>
          <span>{dismissed.size} recommendation(s) dismissed</span>
          <button
            onClick={() => setDismissed(new Set())}
            className={styles.undoButton}
          >
            Undo all
          </button>
        </div>
      )}
    </div>
  );
}
