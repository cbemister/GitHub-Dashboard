import { requireAuth } from "@/lib/auth/session";
import { AnalysisContent } from "@/components/analysis";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AnalysisPage() {
  await requireAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Repository Analysis</h1>
        <p className={styles.subtitle}>
          Explore patterns, themes, and technology stacks across your repositories
        </p>
      </div>

      <AnalysisContent />
    </div>
  );
}
