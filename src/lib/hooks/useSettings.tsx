import { useEffect, useState } from "react";
import { createApiClient } from "@/lib/api";

export type FruitSettings = {
  min_bet: number;
  reveal_fruit: boolean;
  no_win_mode: boolean;
  random_reveal: boolean;
  percentage_to_migrate_balance: number;
};

export const useFruitSettings = () => {
  const [settings, setSettings] = useState<FruitSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      // Read token from URL search params inside hook
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get("authToken");
      if (!authToken) return;

      try {
        const api = createApiClient(authToken);
        const res = await api.get("/fruit-game/settings");
        console.info("settings", res);
        setSettings(res.data);
      } catch (error) {
        console.error("Failed to fetch fruit settings", error);
      }
    };

    fetchSettings();
  }, []); // no dependencies, runs once

  return settings;
};
