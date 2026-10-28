import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useIdentity } from "../identity/IdentityProvider";
import {
  loadDeviceFindLeaderHistory,
  recordDeviceFindLeaderAttempt,
  type FindLeaderHistoryRow,
} from "./findLeaderStorage";
import {
  createFindLeaderHistoryRepository,
  type FindLeaderDailyLeaderboard,
  type FindLeaderHistoryRepository,
} from "./findLeaderHistoryRepository";

interface FindLeaderHistoryContextValue {
  configured: boolean;
  profileBacked: boolean;
  loading: boolean;
  error: string;
  rows: FindLeaderHistoryRow[];
  dailyLeaderboard: FindLeaderDailyLeaderboard | null;
  dailyLeaderboardDay: string | null;
  dailyLeaderboardLoading: boolean;
  dailyLeaderboardError: string;
  refresh: () => Promise<void>;
  loadDailyLeaderboard: (day: string) => Promise<void>;
  recordAttempt: (day: string, score: number) => Promise<void>;
}

const FindLeaderHistoryContext = createContext<FindLeaderHistoryContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not sync Find the Leader history.";
}

function readableLeaderboardError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load today’s leaderboard.";
}

function mergeHistoryRow(rows: FindLeaderHistoryRow[], next: FindLeaderHistoryRow) {
  return [next, ...rows.filter((row) => row.day !== next.day)]
    .sort((left, right) => right.day.localeCompare(left.day));
}

export function FindLeaderHistoryProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: FindLeaderHistoryRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const leaderboardDayRef = useRef<string | null>(null);
  const leaderboardRevisionRef = useRef(0);
  const [repository] = useState<FindLeaderHistoryRepository | null>(() => (
    suppliedRepository === undefined
      ? createFindLeaderHistoryRepository()
      : suppliedRepository
  ));
  const [rows, setRows] = useState<FindLeaderHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyLeaderboard, setDailyLeaderboard] = useState<FindLeaderDailyLeaderboard | null>(null);
  const [dailyLeaderboardDay, setDailyLeaderboardDay] = useState<string | null>(null);
  const [dailyLeaderboardLoading, setDailyLeaderboardLoading] = useState(false);
  const [dailyLeaderboardError, setDailyLeaderboardError] = useState("");
  const profileBacked = Boolean(profileId);

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      setRows(loadDeviceFindLeaderHistory());
      setLoading(false);
      setError("");
      return;
    }

    if (!repository) {
      setRows([]);
      setLoading(false);
      setError("Profile history is not connected on this build.");
      return;
    }

    setLoading(true);
    try {
      const nextRows = await repository.load();
      if (profileIdRef.current !== expectedProfileId) return;
      setRows(nextRows);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoading(false);
    }
  }, [profileId, repository]);

  const loadDailyLeaderboard = useCallback(async (day: string) => {
    const expectedProfileId = profileId;
    const revision = ++leaderboardRevisionRef.current;
    leaderboardDayRef.current = day;
    setDailyLeaderboardDay(day);

    if (!expectedProfileId) {
      setDailyLeaderboard(null);
      setDailyLeaderboardLoading(false);
      setDailyLeaderboardError("");
      return;
    }

    if (!repository?.loadDailyLeaderboard) {
      setDailyLeaderboard(null);
      setDailyLeaderboardLoading(false);
      setDailyLeaderboardError("Today’s leaderboard is not connected on this build.");
      return;
    }

    setDailyLeaderboardLoading(true);
    try {
      const nextLeaderboard = await repository.loadDailyLeaderboard(day);
      if (revision !== leaderboardRevisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setDailyLeaderboard(nextLeaderboard);
      setDailyLeaderboardError("");
    } catch (nextError) {
      if (revision !== leaderboardRevisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setDailyLeaderboard(null);
      setDailyLeaderboardError(readableLeaderboardError(nextError));
    } finally {
      if (revision === leaderboardRevisionRef.current && profileIdRef.current === expectedProfileId) {
        setDailyLeaderboardLoading(false);
      }
    }
  }, [profileId, repository]);

  useLayoutEffect(() => {
    leaderboardRevisionRef.current += 1;
    leaderboardDayRef.current = null;
    setDailyLeaderboard(null);
    setDailyLeaderboardDay(null);
    setDailyLeaderboardLoading(false);
    setDailyLeaderboardError("");
    void refresh();
  }, [profileId, refresh]);

  useEffect(() => {
    if (!profileId || !repository) return undefined;
    const refreshVisibleData = () => {
      void refresh();
      const day = leaderboardDayRef.current;
      if (day) void loadDailyLeaderboard(day);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshVisibleData();
    };
    window.addEventListener("focus", refreshVisibleData);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refreshVisibleData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadDailyLeaderboard, profileId, refresh, repository]);

  const recordAttempt = useCallback(async (day: string, score: number) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      setRows(recordDeviceFindLeaderAttempt(day, score));
      setError("");
      return;
    }

    if (!repository) {
      setError("Profile history is not connected on this build.");
      return;
    }

    try {
      const saved = await repository.recordAttempt(day, score);
      if (profileIdRef.current !== expectedProfileId) return;
      setRows((current) => mergeHistoryRow(current, saved));
      setError("");
      if (repository.loadDailyLeaderboard) {
        await loadDailyLeaderboard(day);
      }
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    }
  }, [loadDailyLeaderboard, profileId, repository]);

  return (
    <FindLeaderHistoryContext.Provider value={{
      configured: Boolean(repository),
      profileBacked,
      loading,
      error,
      rows,
      dailyLeaderboard,
      dailyLeaderboardDay,
      dailyLeaderboardLoading,
      dailyLeaderboardError,
      refresh,
      loadDailyLeaderboard,
      recordAttempt,
    }}>
      {children}
    </FindLeaderHistoryContext.Provider>
  );
}

export function useFindLeaderHistory() {
  const value = useContext(FindLeaderHistoryContext);
  if (!value) throw new Error("useFindLeaderHistory must be used inside FindLeaderHistoryProvider");
  return value;
}
