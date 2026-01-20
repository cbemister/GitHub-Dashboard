"use client";

import styles from "./TopicCloud.module.css";

interface TopicGroup {
  topic: string;
  count: number;
}

interface TopicCloudProps {
  topics: TopicGroup[];
}

export function TopicCloud({ topics }: TopicCloudProps) {
  if (topics.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No topics found in your repositories</p>
      </div>
    );
  }

  const maxCount = Math.max(...topics.map((t) => t.count));
  const minCount = Math.min(...topics.map((t) => t.count));

  const getSize = (count: number): "sm" | "md" | "lg" | "xl" => {
    if (maxCount === minCount) return "md";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.75) return "xl";
    if (ratio > 0.5) return "lg";
    if (ratio > 0.25) return "md";
    return "sm";
  };

  return (
    <div className={styles.container}>
      <div className={styles.cloud}>
        {topics.slice(0, 30).map((topic) => (
          <span
            key={topic.topic}
            className={`${styles.tag} ${styles[getSize(topic.count)]}`}
            title={`${topic.count} repositories`}
          >
            {topic.topic}
            <span className={styles.count}>{topic.count}</span>
          </span>
        ))}
      </div>
      {topics.length > 30 && (
        <p className={styles.moreText}>+{topics.length - 30} more topics</p>
      )}
    </div>
  );
}
