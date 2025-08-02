import { useEffect, useState, useCallback } from "react";
import { createApiClient } from "@/lib/api";

export type FruitSettings = {
  min_bet: number;
  reveal_fruit: boolean;
  no_win_mode: boolean;
  random_reveal: boolean;
  reveal_block: number;
  commission_balance_migration: number;
  bonus_balance_migration: number;
  number_of_sessions: number;
};

export const useFruitSettings = () => {
  const [settings, setSettings] = useState<FruitSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get("authToken");
    if (!authToken) return;

    try {
      const api = createApiClient(authToken);
      const res = await api.get("/fruit-game/settings");
      setSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch fruit settings", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, refetch: fetchSettings };
};
