import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { syncRepositories } from "@/lib/github/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await requireAuth();

    const result = await syncRepositories(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sync failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalRepos: result.totalRepos,
      newRepos: result.newRepos,
      updatedRepos: result.updatedRepos,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync repositories" },
      { status: 500 }
    );
  }
}
