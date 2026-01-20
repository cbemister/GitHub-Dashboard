import { NextRequest, NextResponse } from "next/server";
import { eq, desc, asc, and, ilike, sql } from "drizzle-orm";
import { db, repositories } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import type { RepoStatus } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const status = searchParams.get("status") as RepoStatus | "all" | null;
    const language = searchParams.get("language");
    const visibility = searchParams.get("visibility") as "all" | "public" | "private" | null;
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "priorityScore";
    const sortDir = searchParams.get("sortDir") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build conditions
    const conditions = [eq(repositories.userId, session.userId)];

    if (status && status !== "all") {
      conditions.push(eq(repositories.status, status));
    }

    if (language && language !== "all") {
      conditions.push(eq(repositories.language, language));
    }

    if (visibility === "public") {
      conditions.push(eq(repositories.isPrivate, false));
    } else if (visibility === "private") {
      conditions.push(eq(repositories.isPrivate, true));
    }

    if (search) {
      conditions.push(
        ilike(repositories.name, `%${search}%`)
      );
    }

    // Build sort
    const sortColumn = {
      priorityScore: repositories.priorityScore,
      stargazersCount: repositories.stargazersCount,
      pushedAt: repositories.pushedAt,
      name: repositories.name,
      openIssuesCount: repositories.openIssuesCount,
    }[sortBy] || repositories.priorityScore;

    const orderBy = sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Execute query
    const offset = (page - 1) * limit;

    const [repos, countResult] = await Promise.all([
      db
        .select()
        .from(repositories)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(repositories)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      repositories: repos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
