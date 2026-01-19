import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, repositories } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import {
  groupByLanguage,
  groupByTopics,
  detectTechStack,
  detectThemes,
  generateFeatureAudit,
  getTechStackByCategory,
  getThemesByCategory,
} from "@/lib/analysis/grouping";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();

    // Get all repositories for the user
    const repos = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, session.userId));

    if (repos.length === 0) {
      return NextResponse.json({
        languageGroups: [],
        topicGroups: [],
        techStack: [],
        techStackByCategory: {},
        themes: [],
        themesByCategory: { technical: [], application: [] },
        featureAudit: [],
        summary: {
          totalRepos: 0,
          languages: 0,
          topics: 0,
          technologies: 0,
          themes: 0,
          appThemes: 0,
        },
      });
    }

    // Generate all analysis data
    const languageGroups = groupByLanguage(repos);
    const topicGroups = groupByTopics(repos);
    const techStack = detectTechStack(repos);
    const techStackByCategory = getTechStackByCategory(techStack);
    const themes = detectThemes(repos);
    const themesByCategory = getThemesByCategory(themes);
    const featureAudit = generateFeatureAudit(repos);

    // Summary stats
    const summary = {
      totalRepos: repos.length,
      languages: languageGroups.filter(g => g.language !== "Unknown").length,
      topics: topicGroups.length,
      technologies: techStack.length,
      themes: themes.length,
      appThemes: themesByCategory.application.length,
    };

    return NextResponse.json({
      languageGroups: languageGroups.slice(0, 15), // Top 15 languages
      topicGroups: topicGroups.slice(0, 20), // Top 20 topics
      techStack: techStack.slice(0, 30), // Top 30 technologies
      techStackByCategory,
      themes,
      themesByCategory,
      featureAudit,
      summary,
    });
  } catch (error) {
    console.error("Error generating analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
