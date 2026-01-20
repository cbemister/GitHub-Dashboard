import type { RepoStatus } from "@/lib/db/schema";
import styles from "./RepoStatusBadge.module.css";

interface RepoStatusBadgeProps {
  status: RepoStatus;
  size?: "sm" | "md";
}

const statusLabels: Record<RepoStatus, string> = {
  active: "Active",
  maintained: "Maintained",
  stale: "Stale",
  abandoned: "Abandoned",
  archived: "Archived",
  deprecated: "Deprecated",
};

export function RepoStatusBadge({ status, size = "sm" }: RepoStatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[status]} ${styles[size]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
