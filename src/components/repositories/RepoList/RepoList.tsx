"use client";

import { useState, useEffect, useCallback } from "react";
import { RepoCard } from "../RepoCard";
import { RepoFilters, type FilterState } from "../RepoFilters";
import type { Repository } from "@/lib/db/schema";
import styles from "./RepoList.module.css";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RepoListResponse {
  repositories: Repository[];
  pagination: Pagination;
}

export function RepoList() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    language: "all",
    visibility: "all",
    search: "",
    sortBy: "priorityScore",
    sortDir: "desc",
  });

  const [page, setPage] = useState(1);

  const fetchRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.language !== "all") params.set("language", filters.language);
      if (filters.visibility !== "all") params.set("visibility", filters.visibility);
      if (filters.search) params.set("search", filters.search);
      params.set("sortBy", filters.sortBy);
      params.set("sortDir", filters.sortDir);
      params.set("page", page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/repositories?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const data: RepoListResponse = await response.json();
      setRepositories(data.repositories);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languageDistribution?.map((l: { language: string }) => l.language) || []);
      }
    } catch {
      // Ignore language fetch errors
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchRepositories} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <RepoFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        languages={languages}
      />

      {isLoading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : repositories.length === 0 ? (
        <div className={styles.empty}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={styles.emptyIcon}
          >
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
          </svg>
          <h3 className={styles.emptyTitle}>No repositories found</h3>
          <p className={styles.emptyText}>
            {filters.search || filters.status !== "all" || filters.language !== "all"
              ? "Try adjusting your filters or search query."
              : "Sync your repositories from the dashboard to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            Showing {repositories.length} of {pagination?.total || 0} repositories
          </div>

          <div className={styles.grid}>
            {repositories.map((repo) => (
              <RepoCard key={repo.id} repository={repo} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={styles.pageButton}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
