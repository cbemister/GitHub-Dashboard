import { requireAuth } from "@/lib/auth/session";
import { InsightsContent } from "@/components/insights/InsightsContent";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await requireAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Insights & Recommendations</h1>
        <p className={styles.subtitle}>
          AI-powered suggestions to help you clean up and organize your repositories
        </p>
      </div>

      <InsightsContent />
    </div>
  );
}
