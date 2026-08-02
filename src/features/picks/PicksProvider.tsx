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
  emptyPickHistory,
  emptyPickSummary,
  eventPicksLocked,
  type PickEvent,
  type PickHistory,
  type PickSummary,
  type UnderdogLock,
} from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";
import { loadPickGroupProgress } from "./picksGroupProgressRepository";
import {
  createPicksRepository,
  type PicksRepository,
} from "./picksRepository";

interface PicksContextValue {
  configured: boolean;
  loading: boolean;
  groupProgressLoading: boolean;
  savingBoutId: string | null;
  savingLock: boolean;
  error: string;
  groupProgressError: string;
  event: PickEvent | null;
  selections: Record<string, string>;
  groupProgress: PickEventMemberProgress[];
  underdogLock: UnderdogLock | null;
  summary: PickSummary;
  history: PickHistory;
  refresh: () => Promise<void>;
  setPick: (boutId: string, fighterSlug: string) => Promise<void>;
  setUnderdogLock: (boutId: string, fighterSlug: string) => Promise<void>;
  clearUnderdogLock: () => Promise<void>;
}

const PicksContext = createContext<PicksContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not update Picks.";
}

function selectionsFromRows(rows: Awaited<ReturnType<PicksRepository["loadMyPicks"]>>) {
  return Object.fromEntries(rows.map((row) => [row.boutId, row.fighterSlug]));
}

export function PicksProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: PicksRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const revisionRef = useRef(0);
  const [repository] = useState<PicksRepository | null>(() => (
    suppliedRepository === undefined ? createPicksRepository() : suppliedRepository
  ));
  const [event, setEvent] = useState<PickEvent | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [groupProgress, setGroupProgress] = useState<PickEventMemberProgress[]>([]);
  const [underdogLock, setUnderdogLockState] = useState<UnderdogLock | null>(null);
  const [summary, setSummary] = useState<PickSummary>(emptyPickSummary);
  const [history, setHistory] = useState<PickHistory>(emptyPickHistory);
  const [loading, setLoading] = useState(false);
  const [groupProgressLoading, setGroupProgressLoading] = useState(false);
  const [savingBoutId, setSavingBoutId] = useState<string | null>(null);
  const [savingLock, setSavingLock] = useState(false);
  const [error, setError] = useState("");
  const [groupProgressError, setGroupProgressError] = useState("");

  useEffect(() => () => {
    ++revisionRef.current;
    profileIdRef.current = null;
  }, []);

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    const revision = ++revisionRef.current;

    if (!repository) {
      setEvent(null);
      setSelections({});
      setGroupProgress([]);
      setUnderdogLockState(null);
      setSummary(emptyPickSummary);
      setHistory(emptyPickHistory);
      setLoading(false);
      setGroupProgressLoading(false);
      setError("Picks are not connected on this build.");
      setGroupProgressError("");
      return;
    }

    setLoading(true);
    try {
      const nextEvent = await repository.loadCurrentEvent();
      if (revision !== revisionRef.current) return;
      setEvent(nextEvent);

      if (!expectedProfileId) {
        setSelections({});
        setGroupProgress([]);
        setUnderdogLockState(null);
        setSummary(emptyPickSummary);
        setHistory(emptyPickHistory);
        setError("");
        setGroupProgressError("");
        return;
      }

      const season = nextEvent?.season ?? new Date().getFullYear();
      setGroupProgressLoading(Boolean(nextEvent));
      const [rows, nextLock, nextSummary, nextHistory, progressResult] = await Promise.all([
        nextEvent ? repository.loadMyPicks(nextEvent.eventId) : Promise.resolve([]),
        nextEvent ? repository.loadMyUnderdogLock(nextEvent.eventId) : Promise.resolve(null),
        repository.loadMySummary(season),
        repository.loadMyHistory(season),
        nextEvent
          ? loadPickGroupProgress(nextEvent.eventId)
              .then((value) => ({ value, error: "" }))
              .catch((progressError: unknown) => ({ value: [], error: readableError(progressError) }))
          : Promise.resolve({ value: [], error: "" }),
      ]);
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setSelections(selectionsFromRows(rows));
      setGroupProgress(progressResult.value);
      setGroupProgressError(progressResult.error);
      setUnderdogLockState(nextLock);
      setSummary(nextSummary);
      setHistory(nextHistory);
      setError("");
    } catch (nextError) {
      if (revision !== revisionRef.current) return;
      setError(readableError(nextError));
    } finally {
      if (revision === revisionRef.current) {
        setLoading(false);
        setGroupProgressLoading(false);
      }
    }
  }, [profileId, repository]);

  useEffect(() => {
    setSavingBoutId(null);
    setSavingLock(false);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!repository) return undefined;
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
  }, [refresh, repository]);

  const setPick = useCallback(async (boutId: string, fighterSlug: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      identity.openDialog();
      return;
    }
    if (!repository || !event) {
      setError("Picks are not connected on this build.");
      return;
    }
    if (eventPicksLocked(event)) {
      setError("Picks are locked for this event.");
      return;
    }

    setSavingBoutId(boutId);
    try {
      const saved = await repository.savePick(event.eventId, boutId, fighterSlug);
      const [nextLock, nextSummary, nextProgress] = await Promise.all([
        repository.loadMyUnderdogLock(event.eventId),
        repository.loadMySummary(event.season),
        loadPickGroupProgress(event.eventId).catch(() => groupProgress),
      ]);
      if (profileIdRef.current !== expectedProfileId) return;
      setSelections((current) => ({ ...current, [saved.boutId]: saved.fighterSlug }));
      setGroupProgress(nextProgress);
      setGroupProgressError("");
      setUnderdogLockState(nextLock);
      setSummary(nextSummary);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingBoutId(null);
    }
  }, [event, groupProgress, identity.openDialog, profileId, repository]);

  const setUnderdogLock = useCallback(async (boutId: string, fighterSlug: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) return identity.openDialog();
    if (!repository || !event || eventPicksLocked(event)) {
      setError("Underdog Lock is closed for this event.");
      return;
    }
    setSavingLock(true);
    try {
      const saved = await repository.setUnderdogLock(event.eventId, boutId, fighterSlug);
      const nextProgress = await loadPickGroupProgress(event.eventId).catch(() => groupProgress);
      if (profileIdRef.current === expectedProfileId) {
        setUnderdogLockState(saved);
        setGroupProgress(nextProgress);
        setGroupProgressError("");
        setError("");
      }
    } catch (nextError) {
      if (profileIdRef.current === expectedProfileId) setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingLock(false);
    }
  }, [event, groupProgress, identity.openDialog, profileId, repository]);

  const clearUnderdogLock = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || !event || eventPicksLocked(event)) return;
    setSavingLock(true);
    try {
      await repository.clearUnderdogLock(event.eventId);
      const nextProgress = await loadPickGroupProgress(event.eventId).catch(() => groupProgress);
      if (profileIdRef.current === expectedProfileId) {
        setUnderdogLockState(null);
        setGroupProgress(nextProgress);
        setGroupProgressError("");
        setError("");
      }
    } catch (nextError) {
      if (profileIdRef.current === expectedProfileId) setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingLock(false);
    }
  }, [event, groupProgress, profileId, repository]);

  return (
    <PicksContext.Provider value={{
      configured: Boolean(repository),
      loading,
      groupProgressLoading,
      savingBoutId,
      savingLock,
      error,
      groupProgressError,
      event,
      selections,
      groupProgress,
      underdogLock,
      summary,
      history,
      refresh,
      setPick,
      setUnderdogLock,
      clearUnderdogLock,
    }}>
      {children}
    </PicksContext.Provider>
  );
}

export function usePicks() {
  const value = useContext(PicksContext);
  if (!value) throw new Error("usePicks must be used inside PicksProvider");
  return value;
}
