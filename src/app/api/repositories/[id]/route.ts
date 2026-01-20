import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db, repositories, repositoryNotes } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const repoId = parseInt(id);

    if (isNaN(repoId)) {
      return NextResponse.json({ error: "Invalid repository ID" }, { status: 400 });
    }

    const repo = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repoId),
        eq(repositories.userId, session.userId)
      ),
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Get notes for this repository
    const notes = await db
      .select()
      .from(repositoryNotes)
      .where(eq(repositoryNotes.repositoryId, repoId))
      .orderBy(repositoryNotes.createdAt);

    return NextResponse.json({
      repository: repo,
      notes,
    });
  } catch (error) {
    console.error("Error fetching repository:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const repoId = parseInt(id);

    if (isNaN(repoId)) {
      return NextResponse.json({ error: "Invalid repository ID" }, { status: 400 });
    }

    const body = await request.json();
    const { userStatus, plannedAction } = body;

    // Verify ownership
    const repo = await db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repoId),
        eq(repositories.userId, session.userId)
      ),
    });

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    // Update repository
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (userStatus !== undefined) updateData.userStatus = userStatus;
    if (plannedAction !== undefined) updateData.plannedAction = plannedAction;

    await db
      .update(repositories)
      .set(updateData)
      .where(eq(repositories.id, repoId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating repository:", error);
    return NextResponse.json(
      { error: "Failed to update repository" },
      { status: 500 }
    );
  }
}
