import { api } from "@/lib/api";

import { Reward } from "../types/reward";
import { mergeRewardsByGroup, toReward } from "../utils/normalizeBackendItem";

export async function fetchRewards(): Promise<Reward[]> {
  try {
    const response = await api.get("/api/brindes/produtos");
    const list = Array.isArray(response.data) ? response.data : [];

    return list.map((item) => toReward(item));
  } catch (error) {
    try {
      const fallbackResponse = await api.get("/api/brindes");
      const list = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
      const mapped = list.map((item) => toReward(item));

      return mergeRewardsByGroup(mapped);
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error
          ? fallbackError.message
          : error instanceof Error
          ? error.message
          : "Não foi possível carregar os brindes.";

      throw new Error(message);
    }
  }
}
