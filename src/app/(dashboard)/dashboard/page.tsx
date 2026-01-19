import { requireAuth } from "@/lib/auth/session";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();

  return <DashboardContent username={session.user.username} />;
}
