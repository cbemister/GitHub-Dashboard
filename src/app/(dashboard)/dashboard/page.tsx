import { requireAuth } from "@/lib/auth/session";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {session.user.username}</h1>
        <p className={styles.subtitle}>
          Here&apos;s an overview of your GitHub repositories
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Total Repositories</h2>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.statNumber}>--</span>
            <span className={styles.statLabel}>Sync to see your repos</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Active</h2>
          </div>
          <div className={styles.cardContent}>
            <span className={`${styles.statNumber} ${styles.statActive}`}>--</span>
            <span className={styles.statLabel}>Updated in last 7 days</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Stale</h2>
          </div>
          <div className={styles.cardContent}>
            <span className={`${styles.statNumber} ${styles.statStale}`}>--</span>
            <span className={styles.statLabel}>No updates in 30-90 days</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Abandoned</h2>
          </div>
          <div className={styles.cardContent}>
            <span className={`${styles.statNumber} ${styles.statAbandoned}`}>--</span>
            <span className={styles.statLabel}>No updates in 90+ days</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Get Started</h2>
        </div>
        <div className={styles.emptyState}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={styles.emptyIcon}
          >
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
          </svg>
          <h3 className={styles.emptyTitle}>Sync your repositories</h3>
          <p className={styles.emptyDescription}>
            Click the button below to fetch your GitHub repositories and see their status.
          </p>
          <button className={styles.syncButton} disabled>
            Sync Repositories (Coming in Phase 3)
          </button>
        </div>
      </div>
    </div>
  );
}
