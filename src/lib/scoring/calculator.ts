import type { RepoStatus } from "@/lib/db/schema";
import type { GitHubRepo } from "@/lib/github/client";
import { getStatusMetrics } from "./status";

interface PriorityFactors {
  activityScore: number; // 0-100: How recently active
  popularityScore: number; // 0-100: Stars, forks, watchers
  maintenanceScore: number; // 0-100: Open issues needing attention
  ownershipScore: number; // 0-100: Is it your own repo, not a fork
}

const WEIGHTS = {
  activity: 0.3,
  popularity: 0.2,
  maintenance: 0.3,
  ownership: 0.2,
};

/**
 * Calculate overall priority score (0-100)
 * Higher score = higher priority = needs more attention
 */
export function calculatePriorityScore(
  repo: GitHubRepo,
  status: RepoStatus
): number {
  const factors = calculateFactors(repo, status);

  const score = Math.round(
    factors.activityScore * WEIGHTS.activity +
      factors.popularityScore * WEIGHTS.popularity +
      factors.maintenanceScore * WEIGHTS.maintenance +
      factors.ownershipScore * WEIGHTS.ownership
  );

  return Math.max(0, Math.min(100, score));
}

function calculateFactors(repo: GitHubRepo, status: RepoStatus): PriorityFactors {
  return {
    activityScore: calculateActivityScore(repo, status),
    popularityScore: calculatePopularityScore(repo),
    maintenanceScore: calculateMaintenanceScore(repo),
    ownershipScore: calculateOwnershipScore(repo),
  };
}

/**
 * Activity score based on status
 * Active repos get high scores - they're your current focus
 * Stale/abandoned repos also get high scores - they need attention
 */
function calculateActivityScore(repo: GitHubRepo, status: RepoStatus): number {
  const statusScores: Record<RepoStatus, number> = {
    active: 90, // Currently working on - high priority
    maintained: 60, // Stable, less urgent
    stale: 80, // Needs attention - high priority
    abandoned: 70, // Needs decision - medium-high priority
    archived: 10, // Done, low priority
    deprecated: 20, // Marked for action, some priority
  };

  return statusScores[status];
}

/**
 * Popularity score using logarithmic scaling
 * Popular repos are more important to maintain
 */
function calculatePopularityScore(repo: GitHubRepo): number {
  // Logarithmic scaling to prevent outliers from dominating
  const starScore = Math.min(50, Math.log10(repo.stargazers_count + 1) * 20);
  const forkScore = Math.min(30, Math.log10(repo.forks_count + 1) * 15);
  const watcherScore = Math.min(20, Math.log10(repo.watchers_count + 1) * 10);

  return Math.round(starScore + forkScore + watcherScore);
}

/**
 * Maintenance burden score
 * More open issues = higher priority
 */
function calculateMaintenanceScore(repo: GitHubRepo): number {
  const issueCount = repo.open_issues_count;

  if (issueCount === 0) return 20; // No issues - low maintenance priority
  if (issueCount <= 5) return 50; // Few issues - moderate priority
  if (issueCount <= 10) return 70; // Several issues - higher priority
  if (issueCount <= 25) return 85; // Many issues - high priority
  return 100; // Lots of issues - highest priority
}

/**
 * Ownership score
 * Your own repos are higher priority than forks
 */
function calculateOwnershipScore(repo: GitHubRepo): number {
  if (repo.fork) {
    // Forks with activity are somewhat important
    const metrics = getStatusMetrics(repo);
    if (metrics.daysSinceLastPush <= 30) {
      return 50; // Active fork - moderate priority
    }
    return 20; // Inactive fork - low priority
  }

  // Your own repos are high priority
  return 80;
}

/**
 * Calculate a "health" score (0-100)
 * Higher = healthier repository
 */
export function calculateHealthScore(repo: GitHubRepo, status: RepoStatus): number {
  let score = 100;

  // Deduct for status
  const statusDeductions: Record<RepoStatus, number> = {
    active: 0,
    maintained: 10,
    stale: 30,
    abandoned: 50,
    archived: 40, // Archived is intentional, not unhealthy
    deprecated: 60,
  };
  score -= statusDeductions[status];

  // Deduct for open issues (relative to activity)
  if (repo.open_issues_count > 0) {
    const issueRatio = Math.min(repo.open_issues_count / 10, 1);
    score -= Math.round(issueRatio * 20);
  }

  // Bonus for popularity (well-maintained popular repos are healthy)
  if (repo.stargazers_count > 10) {
    score += Math.min(10, Math.log10(repo.stargazers_count) * 5);
  }

  // Deduct for being a template (usually less maintained)
  if (repo.is_template) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
