import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
}

async function exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  return response.json();
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

async function fetchGitHubEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) return null;

    const emails = await response.json();
    const primaryEmail = emails.find(
      (e: { primary: boolean; verified: boolean; email: string }) =>
        e.primary && e.verified
    );

    return primaryEmail?.email || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle OAuth errors
  if (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=${error}`);
  }

  // Validate state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!state || state !== storedState) {
    console.error("State mismatch");
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  // Clear the state cookie
  cookieStore.delete("oauth_state");

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);

    if (tokenResponse.error) {
      console.error("Token exchange error:", tokenResponse.error_description);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    const accessToken = tokenResponse.access_token;

    // Fetch GitHub user info
    const githubUser = await fetchGitHubUser(accessToken);
    const email = githubUser.email || (await fetchGitHubEmail(accessToken));

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.githubId, githubUser.id),
    });

    if (user) {
      // Update existing user
      await db
        .update(users)
        .set({
          username: githubUser.login,
          email,
          avatarUrl: githubUser.avatar_url,
          accessToken,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      // Create new user
      const result = await db
        .insert(users)
        .values({
          githubId: githubUser.id,
          username: githubUser.login,
          email,
          avatarUrl: githubUser.avatar_url,
          accessToken,
        })
        .returning();

      user = result[0];
    }

    // Create session
    await createSession(user.id);

    // Redirect to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
  }
}
