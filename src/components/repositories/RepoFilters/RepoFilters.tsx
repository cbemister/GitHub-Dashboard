"use client";

import { useCallback } from "react";
import styles from "./RepoFilters.module.css";

export interface FilterState {
  status: string;
  language: string;
  visibility: string;
  search: string;
  sortBy: string;
  sortDir: string;
}

interface RepoFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  languages: string[];
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "maintained", label: "Maintained" },
  { value: "stale", label: "Stale" },
  { value: "abandoned", label: "Abandoned" },
  { value: "archived", label: "Archived" },
];

const visibilityOptions = [
  { value: "all", label: "All visibility" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const sortOptions = [
  { value: "priorityScore", label: "Priority" },
  { value: "pushedAt", label: "Last updated" },
  { value: "stargazersCount", label: "Stars" },
  { value: "name", label: "Name" },
  { value: "openIssuesCount", label: "Issues" },
];

export function RepoFilters({ filters, onFilterChange, languages }: RepoFiltersProps) {
  const handleChange = useCallback(
    (key: keyof FilterState, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange("search", e.target.value);
    },
    [handleChange]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange({
      status: "all",
      language: "all",
      visibility: "all",
      search: "",
      sortBy: "priorityScore",
      sortDir: "desc",
    });
  }, [onFilterChange]);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.language !== "all" ||
    filters.visibility !== "all" ||
    filters.search !== "";

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories..."
            value={filters.search}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filters}>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={styles.select}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={filters.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className={styles.select}
          >
            <option value="all">All languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={filters.visibility}
            onChange={(e) => handleChange("visibility", e.target.value)}
            className={styles.select}
          >
            {visibilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className={styles.clearButton}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className={styles.sort}>
          <span className={styles.sortLabel}>Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
            className={styles.select}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              handleChange("sortDir", filters.sortDir === "asc" ? "desc" : "asc")
            }
            className={styles.sortDirButton}
            title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
          >
            {filters.sortDir === "asc" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L3.5 3.707V12.5Z" />
                <path d="M5.5 6h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0 0 1ZM5.5 9h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0 0 1ZM5.5 12h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0 0 1Z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 11.293V2.5Z" />
                <path d="M5.5 6h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0 0 1ZM5.5 9h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0 0 1ZM5.5 12h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0 0 1Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
