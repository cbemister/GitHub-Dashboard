import type { Repository, RepoStatus } from "@/lib/db/schema";

export type RecommendationAction = "archive" | "delete" | "review" | "keep";

export interface Recommendation {
  repositoryId: number;
  repository: Repository;
  action: RecommendationAction;
  confidence: number; // 0-100
  reasons: string[];
  priority: number; // 1-5, higher = more urgent
}

interface RecommendationRule {
  name: string;
  check: (repo: Repository) => boolean;
  action: RecommendationAction;
  confidence: number;
  reason: string;
  priority: number;
}

const rules: RecommendationRule[] = [
  // High confidence archive recommendations
  {
    name: "abandoned-no-engagement",
    check: (repo) =>
      repo.status === "abandoned" &&
      (repo.stargazersCount ?? 0) === 0 &&
      (repo.forksCount ?? 0) === 0 &&
      !repo.isFork,
    action: "archive",
    confidence: 90,
    reason: "Abandoned for 90+ days with no community engagement",
    priority: 4,
  },
  {
    name: "description-deprecated",
    check: (repo) => {
      const desc = (repo.description || "").toLowerCase();
      return (
        desc.includes("deprecated") ||
        desc.includes("unmaintained") ||
        desc.includes("no longer maintained") ||
        desc.includes("archived")
      );
    },
    action: "archive",
    confidence: 85,
    reason: "Description indicates project is deprecated or unmaintained",
    priority: 5,
  },

  // Delete recommendations for forks
  {
    name: "unused-fork-abandoned",
    check: (repo) =>
      repo.isFork === true &&
      repo.status === "abandoned" &&
      (repo.stargazersCount ?? 0) === 0,
    action: "delete",
    confidence: 80,
    reason: "Unused fork with no activity in 90+ days",
    priority: 3,
  },
  {
    name: "unused-fork-stale",
    check: (repo) =>
      repo.isFork === true &&
      repo.status === "stale" &&
      (repo.stargazersCount ?? 0) === 0 &&
      (repo.forksCount ?? 0) === 0,
    action: "delete",
    confidence: 70,
    reason: "Stale fork with no downstream activity",
    priority: 2,
  },

  // Review recommendations
  {
    name: "stale-with-issues",
    check: (repo) =>
      repo.status === "stale" && (repo.openIssuesCount ?? 0) > 5,
    action: "review",
    confidence: 75,
    reason: "Stale repository with open issues that need attention",
    priority: 4,
  },
  {
    name: "abandoned-with-stars",
    check: (repo) =>
      repo.status === "abandoned" && (repo.stargazersCount ?? 0) >= 10,
    action: "review",
    confidence: 80,
    reason: "Abandoned repository that still has community interest",
    priority: 4,
  },
  {
    name: "stale-private",
    check: (repo) =>
      repo.status === "stale" && repo.isPrivate === true,
    action: "review",
    confidence: 65,
    reason: "Private repository that may no longer be needed",
    priority: 3,
  },

  // Archive recommendations
  {
    name: "abandoned-private",
    check: (repo) =>
      repo.status === "abandoned" && repo.isPrivate === true,
    action: "archive",
    confidence: 75,
    reason: "Private repository abandoned for 90+ days",
    priority: 3,
  },
  {
    name: "template-abandoned",
    check: (repo) =>
      repo.isTemplate === true && repo.status === "abandoned",
    action: "archive",
    confidence: 70,
    reason: "Template repository that hasn't been updated in 90+ days",
    priority: 2,
  },

  // Keep recommendations (for active/maintained repos)
  {
    name: "active-repo",
    check: (repo) => repo.status === "active",
    action: "keep",
    confidence: 95,
    reason: "Repository is actively maintained",
    priority: 1,
  },
  {
    name: "maintained-repo",
    check: (repo) => repo.status === "maintained",
    action: "keep",
    confidence: 85,
    reason: "Repository is maintained and stable",
    priority: 1,
  },
];

/**
 * Generate recommendations for a list of repositories
 */
export function generateRecommendations(
  repositories: Repository[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const repo of repositories) {
    // Skip already archived repos
    if (repo.isArchived) continue;

    // Find matching rules
    const matchingRules = rules.filter((rule) => rule.check(repo));

    if (matchingRules.length === 0) continue;

    // Use the highest confidence rule
    const bestRule = matchingRules.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Collect all reasons from matching rules with same action
    const reasons = matchingRules
      .filter((r) => r.action === bestRule.action)
      .map((r) => r.reason);

    recommendations.push({
      repositoryId: repo.id,
      repository: repo,
      action: bestRule.action,
      confidence: bestRule.confidence,
      reasons: [...new Set(reasons)], // Remove duplicates
      priority: bestRule.priority,
    });
  }

  // Sort by priority (descending) then confidence (descending)
  return recommendations.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.confidence - a.confidence;
  });
}

/**
 * Get recommendations grouped by action type
 */
export function groupRecommendationsByAction(
  recommendations: Recommendation[]
): Record<RecommendationAction, Recommendation[]> {
  return {
    archive: recommendations.filter((r) => r.action === "archive"),
    delete: recommendations.filter((r) => r.action === "delete"),
    review: recommendations.filter((r) => r.action === "review"),
    keep: recommendations.filter((r) => r.action === "keep"),
  };
}

/**
 * Get summary statistics for recommendations
 */
export function getRecommendationStats(recommendations: Recommendation[]) {
  const grouped = groupRecommendationsByAction(recommendations);

  return {
    total: recommendations.length,
    toArchive: grouped.archive.length,
    toDelete: grouped.delete.length,
    toReview: grouped.review.length,
    toKeep: grouped.keep.length,
    actionNeeded: grouped.archive.length + grouped.delete.length + grouped.review.length,
    highConfidence: recommendations.filter((r) => r.confidence >= 80).length,
  };
}
