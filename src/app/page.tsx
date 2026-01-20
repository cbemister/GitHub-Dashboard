import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>GitHub Repository Dashboard</h1>
        <p className={styles.subtitle}>
          Review the status of your repositories, prioritize your work, and
          identify projects to archive or delete.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Status Overview</h3>
            <p>See which repos are active, stale, or abandoned at a glance</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎯</div>
            <h3>Priority Scoring</h3>
            <p>Smart scoring helps you focus on what matters most</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🧹</div>
            <h3>Cleanup Recommendations</h3>
            <p>Get suggestions for repos to archive or delete</p>
          </div>
        </div>
        <Link href="/login" className={styles.cta}>
          Sign in with GitHub
        </Link>
      </div>
    </main>
  );
}
