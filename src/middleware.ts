import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/repositories", "/insights", "/settings"];
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("gh-dashboard-session");
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Don't redirect from login based on cookie alone - let the page validate the session
  // This prevents redirect loops when cookie exists but session is invalid

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repositories/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/login",
  ],
};
