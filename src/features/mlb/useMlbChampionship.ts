import { useCallback, useEffect, useRef, useState } from "react";
import { loadMlbChampionship, type MlbChampionship } from "./mlbChampionship";

export function useMlbChampionship(enabled: boolean, season = 2026) {
  const [championship, setChampionship] = useState<MlbChampionship | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (!mountedRef.current) return;

    if (!enabled) {
      setChampionship(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const nextChampionship = await loadMlbChampionship(season);
      if (mountedRef.current) setChampionship(nextChampionship);
    } catch (nextError) {
      if (!mountedRef.current) return;
      setChampionship(null);
      setError(nextError instanceof Error ? nextError.message : "MLB Championship could not load.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, season]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { championship, loading, error, reload };
}
