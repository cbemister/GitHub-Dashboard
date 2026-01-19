"use client";

import { useState, useCallback } from "react";

interface SyncResult {
  success: boolean;
  totalRepos: number;
  newRepos: number;
  updatedRepos: number;
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const response = await fetch("/api/repositories/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Sync failed");
      }

      const result: SyncResult = await response.json();
      setLastResult(result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    sync,
    isSyncing,
    lastResult,
    error,
  };
}
