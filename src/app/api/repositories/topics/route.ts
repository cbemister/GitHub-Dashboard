import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, repositories, users } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { createGitHubClient } from "@/lib/github/client";
import { generateTopicsForRepo, setRepoTopics } from "@/lib/github/topics";

export const dynamic = "force-dynamic";

interface TopicResult {
  repoId: number;
  repoName: string;
  fullName: string;
  suggestedTopics: string[];
  applied: boolean;
  error?: string;
}

/**
 * GET /api/repositories/topics
 * Generate suggested topics for all repositories (preview, doesn't apply)
 */
export async function GET() {
  try {
    const session = await requireAuth();

    const repos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, session.userId));

    const results: TopicResult[] = repos.map((repo) => ({
      repoId: repo.id,
      repoName: repo.name,
      fullName: repo.fullName,
      suggestedTopics: generateTopicsForRepo(repo),
      applied: false,
    }));

    // Filter to only repos that would get topics
    const reposWithSuggestions = results.filter((r) => r.suggestedTopics.length > 0);

    return NextResponse.json({
      total: repos.length,
      withSuggestions: reposWithSuggestions.length,
      results: reposWithSuggestions,
    });
  } catch (error) {
    console.error("Error generating topics:", error);
    return NextResponse.json(
      { error: "Failed to generate topics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repositories/topics
 * Apply generated topics to GitHub repositories
 * Body: { repoIds?: number[], applyAll?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { repoIds, applyAll } = body as { repoIds?: number[]; applyAll?: boolean };

    // Get user with access token
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get repositories to process
    let repos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, session.userId));

    // Filter to specific repos if not applying all
    if (!applyAll && repoIds && repoIds.length > 0) {
      repos = repos.filter((r) => repoIds.includes(r.id));
    }

    const client = createGitHubClient(user.accessToken);
    const results: TopicResult[] = [];

    for (const repo of repos) {
      const suggestedTopics = generateTopicsForRepo(repo);

      if (suggestedTopics.length === 0) {
        continue; // Skip repos with no suggestions
      }

      // Extract owner from fullName (e.g., "owner/repo")
      const [owner, repoName] = repo.fullName.split("/");

      // Apply topics to GitHub
      const result = await setRepoTopics(client, owner, repoName, suggestedTopics);

      if (result.success) {
        // Update local database
        await db
          .update(repositories)
          .set({ topics: suggestedTopics, updatedAt: new Date() })
          .where(eq(repositories.id, repo.id));
      }

      results.push({
        repoId: repo.id,
        repoName: repo.name,
        fullName: repo.fullName,
        suggestedTopics,
        applied: result.success,
        error: result.error,
      });
    }

    const applied = results.filter((r) => r.applied).length;
    const failed = results.filter((r) => !r.applied).length;

    return NextResponse.json({
      success: true,
      applied,
      failed,
      results,
    });
  } catch (error) {
    console.error("Error applying topics:", error);
    return NextResponse.json(
      { error: "Failed to apply topics" },
      { status: 500 }
    );
  }
}
