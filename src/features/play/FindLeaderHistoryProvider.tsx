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
import type {
  FindLeaderDailyLeaderboard,
  FindLeaderHistoryRepository,
} from "./findLeaderHistoryRepository";
import {
  createTodayChallengeRepository,
  type TodayChallengeHistoryRow,
  type TodayChallengeLeaderboard,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
  type TodayChallengeStreak,
} from "./todayChallengeRepository";

type HistoryRepository = TodayChallengeRepository | FindLeaderHistoryRepository;

interface FindLeaderHistoryContextValue {
  configured: boolean;
  profileBacked: boolean;
  loading: boolean;
  error: string;
  rows: FindLeaderHistoryRow[];
  dailyRows: TodayChallengeHistoryRow[];
  dailyStreak: TodayChallengeStreak | null;
  todayChallenge: TodayChallengeProjection | null;
  dailyLeaderboard: TodayChallengeLeaderboard | null;
  dailyLeaderboardDay: string | null;
  dailyLeaderboardLoading: boolean;
  dailyLeaderboardError: string;
  refresh: () => Promise<void>;
  loadDailyLeaderboard: (day: string, scheduleVersion?: string) => Promise<void>;
  recordAttempt: (day: string, score: number) => Promise<void>;
}

const FindLeaderHistoryContext = createContext<FindLeaderHistoryContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not sync Today’s Challenge history.";
}

function legacyFindLeaderRows(rows: TodayChallengeHistoryRow[]): FindLeaderHistoryRow[] {
  return rows
    .filter((row) => row.gameType === "find_leader")
    .map((row) => ({
      day: row.day,
      officialScore: row.nativeScore,
      bestScore: row.nativeScore,
      attempts: 1,
      completedAt: row.completedAt,
    }));
}

function legacyLeaderboard(value: FindLeaderDailyLeaderboard): TodayChallengeLeaderboard {
  return {
    unlocked: value.unlocked,
    playerCount: value.playerCount,
    entries: value.entries.map((entry) => ({
      rank: entry.rank,
      displayName: entry.displayName,
      initials: entry.initials,
      avatarPhotoData: entry.avatarPhotoData,
      gameType: "find_leader",
      nativeScore: entry.officialScore,
      normalizedScore: entry.officialScore * 10,
      isCurrentUser: entry.isCurrentUser,
    })),
  };
}

function mergeHistoryRow(rows: FindLeaderHistoryRow[], next: FindLeaderHistoryRow) {
  return [next, ...rows.filter((row) => row.day !== next.day)]
    .sort((left, right) => right.day.localeCompare(left.day));
}

export function FindLeaderHistoryProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: HistoryRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const leaderboardDayRef = useRef<string | null>(null);
  const leaderboardVersionRef = useRef<string | undefined>(undefined);
  const leaderboardRevisionRef = useRef(0);
  const [repository] = useState<HistoryRepository | null>(() => (
    suppliedRepository === undefined ? createTodayChallengeRepository() : suppliedRepository
  ));
  const [rows, setRows] = useState<FindLeaderHistoryRow[]>([]);
  const [dailyRows, setDailyRows] = useState<TodayChallengeHistoryRow[]>([]);
  const [dailyStreak, setDailyStreak] = useState<TodayChallengeStreak | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<TodayChallengeProjection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyLeaderboard, setDailyLeaderboard] = useState<TodayChallengeLeaderboard | null>(null);
  const [dailyLeaderboardDay, setDailyLeaderboardDay] = useState<string | null>(null);
  const [dailyLeaderboardLoading, setDailyLeaderboardLoading] = useState(false);
  const [dailyLeaderboardError, setDailyLeaderboardError] = useState("");
  const profileBacked = Boolean(profileId);

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      setRows(loadDeviceFindLeaderHistory());
      setDailyRows([]);
      setDailyStreak(null);
      setTodayChallenge(null);
      setLoading(false);
      setError("");
      return;
    }

    if (!repository) {
      setRows([]);
      setDailyRows([]);
      setDailyStreak(null);
      setTodayChallenge(null);
      setLoading(false);
      setError("Profile history is not connected on this build.");
      return;
    }

    setLoading(true);
    try {
      if ("loadToday" in repository) {
        const [today, history, streak] = await Promise.all([
          repository.loadToday(),
          repository.loadHistory(),
          repository.loadStreak(),
        ]);
        if (profileIdRef.current !== expectedProfileId) return;
        setTodayChallenge(today);
        setDailyRows(history);
        setRows(legacyFindLeaderRows(history));
        setDailyStreak(streak);
      } else {
        const history = await repository.load();
        if (profileIdRef.current !== expectedProfileId) return;
        setRows(history);
        setDailyRows([]);
        setDailyStreak(null);
        setTodayChallenge(null);
      }
      setError("");
    } catch (nextError) {
      if (profileIdRef.current === expectedProfileId) setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoading(false);
    }
  }, [profileId, repository]);

  const loadDailyLeaderboard = useCallback(async (day: string, scheduleVersion?: string) => {
    const expectedProfileId = profileId;
    const revision = ++leaderboardRevisionRef.current;
    const version = scheduleVersion ?? todayChallenge?.scheduleVersion;
    leaderboardDayRef.current = day;
    leaderboardVersionRef.current = version;
    setDailyLeaderboardDay(day);

    if (!expectedProfileId) {
      setDailyLeaderboard(null);
      setDailyLeaderboardLoading(false);
      setDailyLeaderboardError("");
      return;
    }

    if (!repository) {
      setDailyLeaderboard(null);
      setDailyLeaderboardLoading(false);
      setDailyLeaderboardError("Today’s leaderboard is not connected on this build.");
      return;
    }

    setDailyLeaderboardLoading(true);
    try {
      let next: TodayChallengeLeaderboard | null = null;
      if ("loadToday" in repository) {
        if (!version) {
          setDailyLeaderboard(null);
          setDailyLeaderboardError("");
          return;
        }
        next = await repository.loadDailyLeaderboard(day, version);
      } else if (repository.loadDailyLeaderboard) {
        next = legacyLeaderboard(await repository.loadDailyLeaderboard(day));
      }
      if (revision !== leaderboardRevisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setDailyLeaderboard(next);
      setDailyLeaderboardError("");
    } catch (nextError) {
      if (revision !== leaderboardRevisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setDailyLeaderboard(null);
      setDailyLeaderboardError(readableError(nextError));
    } finally {
      if (revision === leaderboardRevisionRef.current && profileIdRef.current === expectedProfileId) {
        setDailyLeaderboardLoading(false);
      }
    }
  }, [profileId, repository, todayChallenge?.scheduleVersion]);

  useLayoutEffect(() => {
    leaderboardRevisionRef.current += 1;
    leaderboardDayRef.current = null;
    leaderboardVersionRef.current = undefined;
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
      if (day) void loadDailyLeaderboard(day, leaderboardVersionRef.current);
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

    if ("loadToday" in repository) {
      setError("Official daily results are saved by the Today’s Challenge runtime.");
      return;
    }

    try {
      const saved = await repository.recordAttempt(day, score);
      if (profileIdRef.current !== expectedProfileId) return;
      setRows((current) => mergeHistoryRow(current, saved));
      setError("");
      if (repository.loadDailyLeaderboard) await loadDailyLeaderboard(day);
    } catch (nextError) {
      if (profileIdRef.current === expectedProfileId) setError(readableError(nextError));
    }
  }, [loadDailyLeaderboard, profileId, repository]);

  return (
    <FindLeaderHistoryContext.Provider value={{
      configured: Boolean(repository),
      profileBacked,
      loading,
      error,
      rows,
      dailyRows,
      dailyStreak,
      todayChallenge,
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
