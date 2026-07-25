import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  type FindLeaderHistoryRepository,
} from "./findLeaderHistoryRepository";

interface FindLeaderHistoryContextValue {
  configured: boolean;
  profileBacked: boolean;
  loading: boolean;
  error: string;
  rows: FindLeaderHistoryRow[];
  refresh: () => Promise<void>;
  recordAttempt: (day: string, score: number) => Promise<void>;
}

const FindLeaderHistoryContext = createContext<FindLeaderHistoryContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not sync Find the Leader history.";
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
  const [repository] = useState<FindLeaderHistoryRepository | null>(() => (
    suppliedRepository === undefined
      ? createFindLeaderHistoryRepository()
      : suppliedRepository
  ));
  const [rows, setRows] = useState<FindLeaderHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!profileId || !repository) return undefined;
    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [profileId, refresh, repository]);

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
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    }
  }, [profileId, repository]);

  return (
    <FindLeaderHistoryContext.Provider value={{
      configured: Boolean(repository),
      profileBacked,
      loading,
      error,
      rows,
      refresh,
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
