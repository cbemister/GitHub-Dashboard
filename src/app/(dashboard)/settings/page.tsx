import { requireAuth } from "@/lib/auth/session";
import { SettingsContent } from "@/components/settings/SettingsContent";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAuth();

  return <SettingsContent user={session.user} />;
}
