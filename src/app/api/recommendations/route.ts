import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, repositories } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import {
  generateRecommendations,
  getRecommendationStats,
  groupRecommendationsByAction,
} from "@/lib/scoring/recommendations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();

    // Get all repositories for the user
    const repos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, session.userId));

    // Generate recommendations
    const recommendations = generateRecommendations(repos);
    const stats = getRecommendationStats(recommendations);
    const grouped = groupRecommendationsByAction(recommendations);

    // Return only actionable recommendations (not "keep")
    const actionable = recommendations.filter((r) => r.action !== "keep");

    return NextResponse.json({
      recommendations: actionable.slice(0, 20), // Top 20 recommendations
      stats,
      grouped: {
        archive: grouped.archive.slice(0, 10),
        delete: grouped.delete.slice(0, 10),
        review: grouped.review.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
