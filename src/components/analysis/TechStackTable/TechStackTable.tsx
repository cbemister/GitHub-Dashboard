"use client";

import { useState } from "react";
import styles from "./TechStackTable.module.css";

interface TechStackItem {
  name: string;
  category: "language" | "framework" | "tool" | "platform" | "database" | "other";
  count: number;
}

interface TechStackTableProps {
  techStackByCategory: Record<string, TechStackItem[]>;
}

const categoryLabels: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  platform: "Platforms",
  tool: "Tools",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  language: "var(--color-primary)",
  framework: "var(--color-success)",
  database: "var(--color-warning)",
  platform: "var(--color-info)",
  tool: "var(--color-danger)",
  other: "var(--color-foreground-secondary)",
};

export function TechStackTable({ techStackByCategory }: TechStackTableProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = Object.keys(categoryLabels).filter(
    (cat) => techStackByCategory[cat]?.length > 0
  );

  const getTotalCount = () => {
    return Object.values(techStackByCategory).reduce(
      (sum, items) => sum + items.length,
      0
    );
  };

  const getItemsToShow = () => {
    if (activeCategory === "all") {
      return Object.entries(techStackByCategory)
        .flatMap(([category, items]) =>
          items.map((item) => ({ ...item, category: category as TechStackItem["category"] }))
        )
        .sort((a, b) => b.count - a.count);
    }
    return techStackByCategory[activeCategory] || [];
  };

  const items = getItemsToShow();

  if (getTotalCount() === 0) {
    return (
      <div className={styles.empty}>
        <p>No tech stack data available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeCategory === "all" ? styles.active : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All ({getTotalCount()})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${activeCategory === cat ? styles.active : ""}`}
            onClick={() => setActiveCategory(cat)}
            style={
              activeCategory === cat
                ? { borderBottomColor: categoryColors[cat] }
                : undefined
            }
          >
            {categoryLabels[cat]} ({techStackByCategory[cat]?.length || 0})
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Technology</th>
              <th>Category</th>
              <th className={styles.countCol}>Repos</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 25).map((item) => (
              <tr key={`${item.category}-${item.name}`}>
                <td>
                  <span className={styles.techName}>{item.name}</span>
                </td>
                <td>
                  <span
                    className={styles.badge}
                    style={{ backgroundColor: categoryColors[item.category] }}
                  >
                    {categoryLabels[item.category]}
                  </span>
                </td>
                <td className={styles.countCol}>
                  <span className={styles.count}>{item.count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length > 25 && (
        <p className={styles.moreText}>
          Showing 25 of {items.length} technologies
        </p>
      )}
    </div>
  );
}
