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
  repositories: Repository[];
  keywords: string[];
}

interface ThemeClusterProps {
  themes: Theme[];
}

const themeIcons: Record<string, string> = {
  "Web Applications": "M16 3C8.268 3 2 9.268 2 17c0 3.186 1.065 6.124 2.857 8.475l-.857.857V28h1.668l.857-.857A13.93 13.93 0 0016 31c7.732 0 14-6.268 14-14S23.732 3 16 3z",
  "CLI Tools": "M0 2.75A.75.75 0 01.75 2h7.5a.75.75 0 010 1.5H.75A.75.75 0 010 2.75zm.75 3.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H.75z",
  "Libraries & Packages": "M3 3a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V3z",
  "APIs & Services": "M7.75 14A1.75 1.75 0 016 12.25v-8.5C6 2.784 6.784 2 7.75 2h6.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14z",
  "Data & Analytics": "M16 8a7.97 7.97 0 00-5.657 2.343l-1.414-1.414A9.97 9.97 0 0116 6V0l6 6-6 6V8z",
  "DevOps & Infrastructure": "M8.5 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8.5 8.5 0 1117 0A8.5 8.5 0 010 8z",
  "Learning & Experiments": "M12 2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9.5 7a.75.75 0 000 1.5h-3a.75.75 0 000-1.5h3z",
  "Templates & Starters": "M5.962 2.513a.75.75 0 01-.475.949l-.816.272a.25.25 0 00-.171.237V4.5h6v-.528a.25.25 0 00-.172-.237l-.816-.272a.75.75 0 11.474-1.424l.816.272c.808.27 1.348 1.022 1.348 1.853V4.5h1.5a.75.75 0 010 1.5H.75a.75.75 0 010-1.5h1.5v-.028c0-.831.54-1.583 1.348-1.853l.816-.272a.75.75 0 01.949.475z",
};

export function ThemeCluster({ themes }: ThemeClusterProps) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  if (themes.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No themes detected in your repositories</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {themes.map((theme) => (
          <div
            key={theme.name}
            className={`${styles.card} ${expandedTheme === theme.name ? styles.expanded : ""}`}
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
    </div>
  );
}
