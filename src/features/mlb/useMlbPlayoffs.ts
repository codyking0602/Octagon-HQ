import { useCallback, useEffect, useRef, useState } from "react";
import { MLB_PLAYOFFS_SEASON } from "./mlbPlayoffsConfig";
import {
  loadMlbPlayoffsHub,
  saveMlbPlayoffBracket,
  saveMlbSeriesPick,
  type MlbPlayoffsHub,
} from "./mlbPlayoffsRepository";

export function useMlbPlayoffs(enabled = true) {
  const [hub, setHub] = useState<MlbPlayoffsHub | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;
    setLoading(true);
    setError("");
    try {
      const nextHub = await loadMlbPlayoffsHub(MLB_PLAYOFFS_SEASON);
      if (mountedRef.current) setHub(nextHub);
    } catch (nextError) {
      if (!mountedRef.current) return;
      setError(nextError instanceof Error ? nextError.message : "MLB Playoffs could not load.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveBracket = useCallback(async (picks: Record<string, string>) => {
    if (!mountedRef.current) return false;
    setSaving("bracket");
    setError("");
    try {
      const next = await saveMlbPlayoffBracket(MLB_PLAYOFFS_SEASON, picks);
      if (mountedRef.current) setHub(next);
      return mountedRef.current;
    } catch (nextError) {
      if (!mountedRef.current) return false;
      setError(nextError instanceof Error ? nextError.message : "The bracket could not be saved.");
      return false;
    } finally {
      if (mountedRef.current) setSaving("");
    }
  }, []);

  const saveSeriesPick = useCallback(async (seriesId: string, teamId: string) => {
    if (!mountedRef.current) return false;
    setSaving(seriesId);
    setError("");
    try {
      const next = await saveMlbSeriesPick(seriesId, teamId);
      if (mountedRef.current) setHub(next);
      return mountedRef.current;
    } catch (nextError) {
      if (!mountedRef.current) return false;
      setError(nextError instanceof Error ? nextError.message : "The series pick could not be saved.");
      return false;
    } finally {
      if (mountedRef.current) setSaving("");
    }
  }, []);

  return { hub, loading, error, saving, reload, saveBracket, saveSeriesPick };
}
