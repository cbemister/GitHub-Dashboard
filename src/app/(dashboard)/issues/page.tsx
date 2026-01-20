import { IssuesContent } from "@/components/issues/IssuesContent";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default function IssuesPage() {
  return (
    <div className={styles.page}>
      <IssuesContent />
    </div>
  );
}
