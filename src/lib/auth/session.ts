import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { eq, and, gt } from "drizzle-orm";
import { db, sessions, users } from "@/lib/db";

const SESSION_COOKIE = "gh-dashboard-session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionUser {
  id: number;
  githubId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  accessToken: string;
}

export interface Session {
  id: string;
  userId: number;
  user: SessionUser;
  expiresAt: Date;
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) return null;

  const { session, user } = result[0];

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    user: {
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      accessToken: user.accessToken,
    },
  };
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function refreshSession(sessionId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db
    .update(sessions)
    .set({ expiresAt })
    .where(eq(sessions.id, sessionId));

  const cookieStore = await cookies();
  const currentCookie = cookieStore.get(SESSION_COOKIE);

  if (currentCookie) {
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
  }
}
