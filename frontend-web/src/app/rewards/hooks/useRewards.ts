import { useCallback, useEffect, useState } from "react";

import { Reward } from "../types/reward";
import { fetchRewards } from "../services/rewardsService";

interface UseRewardsResult {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useRewards(): UseRewardsResult {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRewards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRewards();
      setRewards(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar os brindes.";
      setError(message);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  return {
    rewards,
    loading,
    error,
    reload: loadRewards,
  };
}
