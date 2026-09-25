import { useCallback, useEffect, useState } from "react";
import { loadMlbChampionship, type MlbChampionship } from "./mlbChampionship";

export function useMlbChampionship(enabled: boolean, season = 2026) {
  const [championship, setChampionship] = useState<MlbChampionship | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!enabled) {
      setChampionship(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setChampionship(await loadMlbChampionship(season));
    } catch (nextError) {
      setChampionship(null);
      setError(nextError instanceof Error ? nextError.message : "MLB Championship could not load.");
    } finally {
      setLoading(false);
    }
  }, [enabled, season]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { championship, loading, error, reload };
}
