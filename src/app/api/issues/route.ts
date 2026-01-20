import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { db, repositories } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createGitHubClient } from "@/lib/github/client";

export const dynamic = "force-dynamic";

interface RepoIssue {
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

interface RepoWithIssues {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  openIssuesCount: number;
  issues: RepoIssue[];
}

export async function GET() {
  try {
    const session = await requireAuth();

    // Fetch all user repositories with issues
    const userRepos = await db.query.repositories.findMany({
      where: eq(repositories.userId, session.userId),
      with: {
        user: true,
      },
    });

    // Filter repos that have open issues
    const reposWithIssues = userRepos.filter(
      (repo) => (repo.openIssuesCount ?? 0) > 0
    );

    if (reposWithIssues.length === 0) {
      return NextResponse.json({ repositories: [] });
    }

    // Fetch issues for each repository
    const client = createGitHubClient(reposWithIssues[0].user.accessToken);
    
    const reposWithIssuesData: RepoWithIssues[] = await Promise.all(
      reposWithIssues.map(async (repo) => {
        const [owner, repoName] = repo.fullName.split("/");

        try {
          const { data: issues } = await client.rest.issues.listForRepo({
            owner,
            repo: repoName,
            state: "open",
            sort: "updated",
            per_page: 10, // Limit to 10 most recent per repo
          });

          const transformedIssues: RepoIssue[] = issues.map((issue) => ({
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

          return {
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            htmlUrl: repo.htmlUrl,
            openIssuesCount: repo.openIssuesCount || 0,
            issues: transformedIssues,
          };
        } catch (error) {
          console.error(`Error fetching issues for ${repo.fullName}:`, error);
          return {
            id: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            htmlUrl: repo.htmlUrl,
            openIssuesCount: repo.openIssuesCount || 0,
            issues: [],
          };
        }
      })
    );

    // Sort by number of open issues (descending)
    reposWithIssuesData.sort(
      (a, b) => b.openIssuesCount - a.openIssuesCount
    );

    const totalIssues = reposWithIssuesData.reduce(
      (sum, repo) => sum + repo.openIssuesCount,
      0
    );

    return NextResponse.json({
      repositories: reposWithIssuesData,
      totalIssues,
      totalRepositories: reposWithIssuesData.length,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
