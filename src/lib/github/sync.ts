import { eq, and } from "drizzle-orm";
import { db, repositories, users } from "@/lib/db";
import { createGitHubClient, fetchAllUserRepos, type GitHubRepo } from "./client";
import { calculateRepoStatus } from "@/lib/scoring/status";
import { calculatePriorityScore, calculateHealthScore } from "@/lib/scoring/calculator";

export interface SyncResult {
  success: boolean;
  totalRepos: number;
  newRepos: number;
  updatedRepos: number;
  error?: string;
}

/**
 * Sync all repositories for a user from GitHub
 */
export async function syncRepositories(userId: number): Promise<SyncResult> {
  try {
    // Get user with access token
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return {
        success: false,
        totalRepos: 0,
        newRepos: 0,
        updatedRepos: 0,
        error: "User not found",
      };
    }

    // Create GitHub client
    const client = createGitHubClient(user.accessToken);

    // Fetch all repos from GitHub
    const githubRepos = await fetchAllUserRepos(client);

    let newRepos = 0;
    let updatedRepos = 0;

    // Process each repo
    for (const repo of githubRepos) {
      const result = await syncSingleRepo(userId, repo);
      if (result === "created") {
        newRepos++;
      } else if (result === "updated") {
        updatedRepos++;
      }
    }

    // Update user's lastSyncAt
    await db
      .update(users)
      .set({ lastSyncAt: new Date() })
      .where(eq(users.id, userId));

    return {
      success: true,
      totalRepos: githubRepos.length,
      newRepos,
      updatedRepos,
    };
  } catch (error) {
    console.error("Sync error:", error);
    return {
      success: false,
      totalRepos: 0,
      newRepos: 0,
      updatedRepos: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function syncSingleRepo(
  userId: number,
  repo: GitHubRepo
): Promise<"created" | "updated" | "unchanged"> {
  // Calculate status and scores
  const status = calculateRepoStatus(repo);
  const priorityScore = calculatePriorityScore(repo, status);
  const healthScore = calculateHealthScore(repo, status);

  // Check if repo already exists
  const existingRepo = await db.query.repositories.findFirst({
    where: and(
      eq(repositories.userId, userId),
      eq(repositories.githubId, repo.id)
    ),
  });

  const repoData = {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    htmlUrl: repo.html_url,
    isPrivate: repo.private,
    isFork: repo.fork,
    isArchived: repo.archived,
    isTemplate: repo.is_template,
    stargazersCount: repo.stargazers_count,
    watchersCount: repo.watchers_count,
    forksCount: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
    language: repo.language,
    topics: repo.topics || [],
    createdAtGithub: new Date(repo.created_at),
    updatedAtGithub: new Date(repo.updated_at),
    pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
    status,
    priorityScore,
    healthScore,
    lastSyncAt: new Date(),
    syncError: null,
    updatedAt: new Date(),
  };

  if (existingRepo) {
    // Update existing repo (preserve user-defined fields)
    await db
      .update(repositories)
      .set(repoData)
      .where(eq(repositories.id, existingRepo.id));

    return "updated";
  } else {
    // Create new repo
    await db.insert(repositories).values({
      userId,
      githubId: repo.id,
      ...repoData,
    });

    return "created";
  }
}

/**
 * Get sync status for a user
 */
export async function getSyncStatus(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      lastSyncAt: true,
    },
  });

  const repoCount = await db
    .select({ count: repositories.id })
    .from(repositories)
    .where(eq(repositories.userId, userId));

  return {
    lastSyncAt: user?.lastSyncAt || null,
    repoCount: repoCount.length > 0 ? repoCount.length : 0,
  };
}
