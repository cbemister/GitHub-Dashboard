"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  totalRepos: number;
  activeRepos: number;
  maintainedRepos: number;
  staleRepos: number;
  abandonedRepos: number;
  archivedRepos: number;
  deprecatedRepos: number;
  publicRepos: number;
  privateRepos: number;
  forkedRepos: number;
  totalStars: number;
  totalForks: number;
  totalOpenIssues: number;
  lastSyncAt: string | null;
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface LanguageDistribution {
  language: string;
  count: number;
}

interface TopPriorityRepo {
  id: number;
  name: string;
  fullName: string;
  status: string;
  priorityScore: number;
  openIssuesCount: number;
  language: string | null;
}

interface StatsData {
  stats: Stats;
  statusDistribution: StatusDistribution[];
  languageDistribution: LanguageDistribution[];
  topPriorityRepos: TopPriorityRepo[];
}

export function useStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
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
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
