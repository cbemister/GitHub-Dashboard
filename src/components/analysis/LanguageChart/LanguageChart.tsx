"use client";

import styles from "./LanguageChart.module.css";

interface LanguageGroup {
  language: string;
  count: number;
  percentage: number;
  totalStars: number;
  avgHealth: number;
}

interface LanguageChartProps {
  languages: LanguageGroup[];
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Unknown: "#8b949e",
};

function getLanguageColor(language: string): string {
  return languageColors[language] || "#8b949e";
}

export function LanguageChart({ languages }: LanguageChartProps) {
  if (languages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No language data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...languages.map((l) => l.count));

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {languages.slice(0, 10).map((lang) => (
          <div key={lang.language} className={styles.barRow}>
            <div className={styles.label}>
              <span
                className={styles.dot}
                style={{ backgroundColor: getLanguageColor(lang.language) }}
              />
              <span className={styles.name}>{lang.language}</span>
            </div>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{
                  width: `${(lang.count / maxCount) * 100}%`,
                  backgroundColor: getLanguageColor(lang.language),
                }}
              />
              <span className={styles.count}>{lang.count}</span>
            </div>
            <div className={styles.stats}>
              <span className={styles.percentage}>{lang.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
      {languages.length > 10 && (
        <p className={styles.moreText}>
          +{languages.length - 10} more languages
        </p>
      )}
    </div>
  );
}
