"use client";

import { useState, useEffect, useCallback } from "react";
import { LanguageChart } from "../LanguageChart";
import { TopicCloud } from "../TopicCloud";
import { TechStackTable } from "../TechStackTable";
import { ThemeCluster } from "../ThemeCluster";
import { FeatureAuditTable } from "../FeatureAuditTable";
import styles from "./AnalysisContent.module.css";

interface AnalysisData {
  languageGroups: Array<{
    language: string;
    count: number;
    percentage: number;
    totalStars: number;
    avgHealth: number;
  }>;
  topicGroups: Array<{
    topic: string;
    count: number;
  }>;
  techStack: Array<{
    name: string;
    category: "language" | "framework" | "tool" | "platform" | "database" | "other";
    count: number;
  }>;
  techStackByCategory: Record<string, Array<{
    name: string;
    category: "language" | "framework" | "tool" | "platform" | "database" | "other";
    count: number;
  }>>;
  themes: Array<{
    name: string;
    description: string;
    category: "technical" | "application";
    repositories: Array<{
      id: number;
      name: string;
      fullName: string;
      description: string | null;
    }>;
    keywords: string[];
  }>;
  themesByCategory: {
    technical: Array<{
      name: string;
      description: string;
      category: "technical" | "application";
      repositories: Array<{
        id: number;
        name: string;
        fullName: string;
        description: string | null;
      }>;
      keywords: string[];
    }>;
    application: Array<{
      name: string;
      description: string;
      category: "technical" | "application";
      repositories: Array<{
        id: number;
        name: string;
        fullName: string;
        description: string | null;
      }>;
      keywords: string[];
    }>;
  };
  featureAudit: Array<{
    repoId: number;
    repoName: string;
    fullName: string;
    language: string | null;
    hasIssues: boolean;
    hasWiki: boolean;
    isPrivate: boolean;
    isFork: boolean;
    isArchived: boolean;
    isTemplate: boolean;
    hasTopics: boolean;
    hasDescription: boolean;
    stars: number;
    forks: number;
    openIssues: number;
    status: string;
    healthScore: number;
    priorityScore: number;
  }>;
  summary: {
    totalRepos: number;
    languages: number;
    topics: number;
    technologies: number;
    themes: number;
    appThemes: number;
  };
}

type TabId = "overview" | "techstack" | "themes" | "audit";

export function AnalysisContent() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const fetchAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/analysis");

      if (!response.ok) {
        throw new Error("Failed to fetch analysis data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Analyzing your repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchAnalysis} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.summary.totalRepos === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={styles.emptyIcon}
          >
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1H4.5a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          <h3 className={styles.emptyTitle}>No Repositories Found</h3>
          <p className={styles.emptyText}>
            Sync your repositories to see analysis and insights.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "techstack", label: "Tech Stack" },
    { id: "themes", label: "Themes" },
    { id: "audit", label: "Feature Audit" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{data.summary.totalRepos}</div>
          <div className={styles.statLabel}>Total Repos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{data.summary.languages}</div>
          <div className={styles.statLabel}>Languages</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{data.summary.technologies}</div>
          <div className={styles.statLabel}>Technologies</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{data.summary.appThemes}</div>
          <div className={styles.statLabel}>App Types</div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && (
          <div className={styles.overviewGrid}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Languages</h3>
              <LanguageChart languages={data.languageGroups} />
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Topics</h3>
              <TopicCloud topics={data.topicGroups} onTopicsGenerated={fetchAnalysis} />
            </div>
          </div>
        )}

        {activeTab === "techstack" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Technology Stack</h3>
            <p className={styles.sectionDesc}>
              Technologies detected across your repositories based on names, descriptions, and topics.
            </p>
            <TechStackTable techStackByCategory={data.techStackByCategory} />
          </div>
        )}

        {activeTab === "themes" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Project Themes</h3>
            <p className={styles.sectionDesc}>
              Discover similar apps and common patterns across your repositories.
            </p>
            <ThemeCluster themes={data.themes} themesByCategory={data.themesByCategory} />
          </div>
        )}

        {activeTab === "audit" && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Feature Audit</h3>
            <p className={styles.sectionDesc}>
              Overview of features and metadata across all repositories.
            </p>
            <FeatureAuditTable features={data.featureAudit} />
          </div>
        )}
      </div>
    </div>
  );
}
