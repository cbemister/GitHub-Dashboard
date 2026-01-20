"use client";

import { useState } from "react";
import styles from "./ThemeCluster.module.css";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
}

interface Theme {
  name: string;
  description: string;
  category: "technical" | "application";
  repositories: Repository[];
  keywords: string[];
}

interface ThemesByCategory {
  technical: Theme[];
  application: Theme[];
}

interface ThemeClusterProps {
  themes: Theme[];
  themesByCategory: ThemesByCategory;
}

type CategoryTab = "all" | "application" | "technical";

export function ThemeCluster({ themes, themesByCategory }: ThemeClusterProps) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryTab>("application");

  const getThemesToShow = (): Theme[] => {
    if (activeTab === "all") return themes;
    if (activeTab === "application") return themesByCategory.application;
    return themesByCategory.technical;
  };

  const themesToShow = getThemesToShow();

  if (themes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No themes detected in your repositories</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "application" ? styles.active : ""}`}
          onClick={() => setActiveTab("application")}
        >
          <span className={styles.tabIcon}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
            </svg>
          </span>
          App Types ({themesByCategory.application.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "technical" ? styles.active : ""}`}
          onClick={() => setActiveTab("technical")}
        >
          <span className={styles.tabIcon}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.72 3.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L7.44 7 4.72 4.28a.75.75 0 0 1 0-1.06Zm4.25 7.28a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
            </svg>
          </span>
          Technical ({themesByCategory.technical.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({themes.length})
        </button>
      </div>

      {activeTab === "application" && themesByCategory.application.length > 0 && (
        <p className={styles.categoryDescription}>
          Similar application types found across your repositories - compare projects in the same domain
        </p>
      )}

      {activeTab === "technical" && themesByCategory.technical.length > 0 && (
        <p className={styles.categoryDescription}>
          Technical patterns and project types detected in your repositories
        </p>
      )}

      {themesToShow.length === 0 ? (
        <div className={styles.noResults}>
          <p>No themes found in this category</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {themesToShow.map((theme) => (
            <div
              key={theme.name}
              className={`${styles.card} ${expandedTheme === theme.name ? styles.expanded : ""} ${styles[theme.category]}`}
            >
              <button
                className={styles.header}
                onClick={() =>
                  setExpandedTheme(expandedTheme === theme.name ? null : theme.name)
                }
              >
                <div className={styles.titleRow}>
                  <h4 className={styles.title}>{theme.name}</h4>
                  <span className={styles.count}>{theme.repositories.length}</span>
                </div>
                <p className={styles.description}>{theme.description}</p>
                <div className={styles.keywords}>
                  {theme.keywords.map((kw) => (
                    <span key={kw} className={styles.keyword}>
                      {kw}
                    </span>
                  ))}
                </div>
              </button>
              {expandedTheme === theme.name && (
                <div className={styles.repos}>
                  {theme.repositories.slice(0, 10).map((repo) => (
                    <div key={repo.id} className={styles.repo}>
                      <span className={styles.repoName}>{repo.name}</span>
                      {repo.description && (
                        <span className={styles.repoDesc}>{repo.description}</span>
                      )}
                    </div>
                  ))}
                  {theme.repositories.length > 10 && (
                    <p className={styles.moreRepos}>
                      +{theme.repositories.length - 10} more repositories
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
