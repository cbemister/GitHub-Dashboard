import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await deleteSession();

  return NextResponse.json({ success: true });
}

export async function GET() {
  await deleteSession();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(appUrl);
}
