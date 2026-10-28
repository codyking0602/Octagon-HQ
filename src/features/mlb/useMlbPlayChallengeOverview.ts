import { useCallback, useEffect, useState } from "react";
import {
  loadMlbPlayChallengeOverview,
  type MlbPlayChallengeOverview,
} from "./mlbPlayChallenge";

export function useMlbPlayChallengeOverview({
  enabled,
  season,
  challengeKey,
}: {
  enabled: boolean;
  season: number;
  challengeKey: string;
}) {
  const [overview, setOverview] = useState<MlbPlayChallengeOverview | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!enabled) {
      setOverview(null);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setOverview(await loadMlbPlayChallengeOverview(season, challengeKey));
    } catch (nextError) {
      setOverview(null);
      setError(nextError instanceof Error ? nextError.message : "MLB Play challenge could not load.");
    } finally {
      setLoading(false);
    }
  }, [challengeKey, enabled, season]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { overview, loading, error, reload };
}
