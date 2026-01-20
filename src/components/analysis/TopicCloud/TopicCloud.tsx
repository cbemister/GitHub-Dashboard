"use client";

import { useState } from "react";
import styles from "./TopicCloud.module.css";

interface TopicGroup {
  topic: string;
  count: number;
}

interface TopicCloudProps {
  topics: TopicGroup[];
  onTopicsGenerated?: () => void;
}

export function TopicCloud({ topics, onTopicsGenerated }: TopicCloudProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{
    applied: number;
    failed: number;
  } | null>(null);

  const handleGenerateTopics = async () => {
    if (!confirm("This will auto-generate and apply topics to your GitHub repositories based on their names, descriptions, and languages. Continue?")) {
      return;
    }

    setIsGenerating(true);
    setGenerateResult(null);

    try {
      const response = await fetch("/api/repositories/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyAll: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate topics");
      }

      const result = await response.json();
      setGenerateResult({ applied: result.applied, failed: result.failed });

      // Trigger refresh of analysis data
      if (onTopicsGenerated) {
        onTopicsGenerated();
      }
    } catch (error) {
      console.error("Error generating topics:", error);
      alert("Failed to generate topics. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (topics.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No topics found in your repositories</p>
        <button
          onClick={handleGenerateTopics}
          disabled={isGenerating}
          className={styles.generateButton}
        >
          {isGenerating ? "Generating..." : "Auto-Generate Topics"}
        </button>
        {generateResult && (
          <p className={styles.result}>
            Applied topics to {generateResult.applied} repos
            {generateResult.failed > 0 && `, ${generateResult.failed} failed`}
          </p>
        )}
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
