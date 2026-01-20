import type { Repository, RepoStatus, ActionType } from "@/lib/db/schema";

export type { Repository, RepoStatus, ActionType };

export interface RepositoryWithStats extends Repository {
  daysSinceLastPush: number;
  daysSinceLastUpdate: number;
}

export interface RepositoryFilters {
  status?: RepoStatus | "all";
  language?: string | "all";
  visibility?: "all" | "public" | "private";
  search?: string;
  hasIssues?: boolean;
  isFork?: boolean;
}

export type SortField =
  | "priorityScore"
  | "stargazersCount"
  | "pushedAt"
  | "name"
  | "openIssuesCount";

export type SortDirection = "asc" | "desc";

export interface RepositorySort {
  field: SortField;
  direction: SortDirection;
}

export interface Recommendation {
  repositoryId: number;
  action: "archive" | "delete" | "review" | "keep";
  confidence: number;
  reasons: string[];
}

export interface DashboardStats {
  totalRepos: number;
  activeRepos: number;
  maintainedRepos: number;
  staleRepos: number;
  abandonedRepos: number;
  archivedRepos: number;
  publicRepos: number;
  privateRepos: number;
  forkedRepos: number;
  totalStars: number;
  totalForks: number;
  totalOpenIssues: number;
}

export interface StatusDistribution {
  status: RepoStatus;
  count: number;
  percentage: number;
}
