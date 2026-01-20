import { NextResponse } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { db, repositories, users } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();

    // Get user's last sync time
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { lastSyncAt: true },
    });

    // Get all repos for the user to calculate stats
    const repos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, session.userId));

    // Calculate stats
    const stats = {
      totalRepos: repos.length,
      activeRepos: repos.filter((r) => r.status === "active").length,
      maintainedRepos: repos.filter((r) => r.status === "maintained").length,
      staleRepos: repos.filter((r) => r.status === "stale").length,
      abandonedRepos: repos.filter((r) => r.status === "abandoned").length,
      archivedRepos: repos.filter((r) => r.status === "archived").length,
      deprecatedRepos: repos.filter((r) => r.status === "deprecated").length,
      publicRepos: repos.filter((r) => !r.isPrivate).length,
      privateRepos: repos.filter((r) => r.isPrivate).length,
      forkedRepos: repos.filter((r) => r.isFork).length,
      totalStars: repos.reduce((sum, r) => sum + (r.stargazersCount || 0), 0),
      totalForks: repos.reduce((sum, r) => sum + (r.forksCount || 0), 0),
      totalOpenIssues: repos.reduce((sum, r) => sum + (r.openIssuesCount || 0), 0),
      lastSyncAt: user?.lastSyncAt || null,
    };

    // Calculate status distribution
    const statusDistribution = [
      { status: "active", count: stats.activeRepos },
      { status: "maintained", count: stats.maintainedRepos },
      { status: "stale", count: stats.staleRepos },
      { status: "abandoned", count: stats.abandonedRepos },
      { status: "archived", count: stats.archivedRepos },
    ]
      .filter((s) => s.count > 0)
      .map((s) => ({
        ...s,
        percentage: stats.totalRepos > 0
          ? Math.round((s.count / stats.totalRepos) * 100)
          : 0,
      }));

    // Get language distribution
    const languageCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }
    const languageDistribution = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top priority repos
    const topPriorityRepos = repos
      .filter((r) => r.status !== "archived")
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        status: r.status,
        priorityScore: r.priorityScore,
        openIssuesCount: r.openIssuesCount,
        language: r.language,
      }));

    // Get active projects (recently updated, sorted by push date)
    const activeProjects = repos
      .filter((r) => r.status === "active" || r.status === "maintained")
      .sort((a, b) => {
        const dateA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
        const dateB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        status: r.status,
        language: r.language,
        stargazersCount: r.stargazersCount,
        pushedAt: r.pushedAt,
        htmlUrl: r.htmlUrl,
      }));

    return NextResponse.json({
      stats,
      statusDistribution,
      languageDistribution,
      topPriorityRepos,
      activeProjects,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
