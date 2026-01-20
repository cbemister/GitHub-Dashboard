import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db, repositories, users } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createGitHubClient } from "@/lib/github/client";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await context.params;
    const repoId = parseInt(id);

    if (isNaN(repoId)) {
      return NextResponse.json({ error: "Invalid repository ID" }, { status: 400 });
    }

    // Fetch repository with user details
    const repo = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repoId),
        eq(repositories.userId, session.userId)
      ),
      with: {
        user: true,
      },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Extract owner and repo name from full_name
    const [owner, repoName] = repo.fullName.split("/");

    // Create GitHub client
    const client = createGitHubClient(repo.user.accessToken);

    // Fetch issues from GitHub
    const { data: issues } = await client.rest.issues.listForRepo({
      owner,
      repo: repoName,
      state: "open",
      sort: "updated",
      per_page: 10, // Limit to 10 most recent issues
    });

    // Transform the issues data
    const transformedIssues = issues.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      htmlUrl: issue.html_url,
      user: {
        login: issue.user?.login || "unknown",
        avatarUrl: issue.user?.avatar_url || "",
      },
      labels: issue.labels.map((label) => ({
        name: typeof label === "string" ? label : label.name || "",
        color: typeof label === "string" ? "" : label.color || "",
      })),
      comments: issue.comments,
      isPullRequest: !!issue.pull_request,
    }));

    return NextResponse.json({
      issues: transformedIssues,
      total: repo.openIssuesCount || 0,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
