import { useCallback, useEffect, useState } from "react";
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

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      setHub(await loadMlbPlayoffsHub(MLB_PLAYOFFS_SEASON));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "MLB Playoffs could not load.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveBracket = useCallback(async (picks: Record<string, string>) => {
    setSaving("bracket");
    setError("");
    try {
      const next = await saveMlbPlayoffBracket(MLB_PLAYOFFS_SEASON, picks);
      setHub(next);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The bracket could not be saved.");
      return false;
    } finally {
      setSaving("");
    }
  }, []);

  const saveSeriesPick = useCallback(async (seriesId: string, teamId: string) => {
    setSaving(seriesId);
    setError("");
    try {
      setHub(await saveMlbSeriesPick(seriesId, teamId));
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The series pick could not be saved.");
      return false;
    } finally {
      setSaving("");
    }
  }, []);

  return { hub, loading, error, saving, reload, saveBracket, saveSeriesPick };
}
