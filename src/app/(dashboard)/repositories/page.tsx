import { requireAuth } from "@/lib/auth/session";
import { RepoList } from "@/components/repositories/RepoList";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function RepositoriesPage() {
  await requireAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Repositories</h1>
        <p className={styles.subtitle}>
          Browse, filter, and manage all your GitHub repositories
        </p>
      </div>

      <RepoList />
    </div>
  );
}
