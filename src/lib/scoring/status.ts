import type { RepoStatus } from "@/lib/db/schema";
import type { GitHubRepo } from "@/lib/github/client";

export interface StatusMetrics {
  daysSinceLastPush: number;
  daysSinceLastUpdate: number;
  isArchived: boolean;
}

export function calculateDaysSince(date: string | null): number {
  if (!date) return Infinity;

  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getStatusMetrics(repo: GitHubRepo): StatusMetrics {
  return {
    daysSinceLastPush: calculateDaysSince(repo.pushed_at),
    daysSinceLastUpdate: calculateDaysSince(repo.updated_at),
    isArchived: repo.archived,
  };
}

/**
 * Calculate repository status based on activity
 *
 * Status definitions:
 * - active: Pushed within last 7 days
 * - maintained: Pushed within last 30 days
 * - stale: No push in 30-90 days
 * - abandoned: No push in 90+ days
 * - archived: Officially archived on GitHub
 */
export function calculateRepoStatus(repo: GitHubRepo): RepoStatus {
  // If archived on GitHub, that takes precedence
  if (repo.archived) {
    return "archived";
  }

  const metrics = getStatusMetrics(repo);

  // Active: pushed within last 7 days
  if (metrics.daysSinceLastPush <= 7) {
    return "active";
  }

  // Maintained: pushed within last 30 days
  if (metrics.daysSinceLastPush <= 30) {
    return "maintained";
  }

  // Stale: no push in 30-90 days
  if (metrics.daysSinceLastPush <= 90) {
    return "stale";
  }

  // Abandoned: no push in 90+ days
  return "abandoned";
}

/**
 * Get a human-readable description for a status
 */
export function getStatusDescription(status: RepoStatus): string {
  const descriptions: Record<RepoStatus, string> = {
    active: "Updated within the last 7 days",
    maintained: "Updated within the last 30 days",
    stale: "No updates in 30-90 days",
    abandoned: "No updates in 90+ days",
    archived: "Archived on GitHub",
    deprecated: "Marked for archive/deletion",
  };

  return descriptions[status];
}

/**
 * Get status color class name
 */
export function getStatusColor(status: RepoStatus): string {
  const colors: Record<RepoStatus, string> = {
    active: "success",
    maintained: "info",
    stale: "warning",
    abandoned: "danger",
    archived: "muted",
    deprecated: "muted",
  };

  return colors[status];
}
