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
import type { FootballFuturesPicks } from "./footballPicksScoring";
import {
  emptyPickHistory,
  emptyPickSummary,
  pickBoutLocked,
  type PickEvent,
  type PickHistory,
  type PickSport,
  type PickSummary,
  type UnderdogLock,
} from "./picksModel";
import type { PickEventMemberProgress } from "./groupProgressModel";
import { loadPickGroupProgress } from "./picksGroupProgressRepository";
import {
  createPicksRepository,
  type FootballFuturesSnapshot,
  type PicksRepository,
} from "./picksRepository";

interface PicksContextValue {
  configured: boolean;
  loading: boolean;
  groupProgressLoading: boolean;
  footballSummaryLoading: boolean;
  savingBoutId: string | null;
  savingLock: boolean;
  savingFootballFutures: boolean;
  error: string;
  groupProgressError: string;
  footballSummaryError: string;
  event: PickEvent | null;
  selections: Record<string, string>;
  footballLocks: Record<string, boolean>;
  footballFutures: FootballFuturesSnapshot | null;
  groupProgress: PickEventMemberProgress[];
  underdogLock: UnderdogLock | null;
  summary: PickSummary;
  footballSummary: PickSummary | null;
  history: PickHistory;
  refresh: () => Promise<void>;
  setPick: (boutId: string, fighterSlug: string) => Promise<void>;
  setFootballLock: (boutId: string, isLock: boolean) => Promise<void>;
  saveFootballFutures: (picks: FootballFuturesPicks) => Promise<void>;
  setUnderdogLock: (boutId: string, fighterSlug: string) => Promise<void>;
  clearUnderdogLock: () => Promise<void>;
}

const PicksContext = createContext<PicksContextValue | null>(null);

function readableError(error: unknown) {
  const message = error instanceof Error && error.message
    ? error.message
    : "Octagon HQ could not update Picks.";
  const normalized = message.toLowerCase();
  if (normalized.includes("football_lock_limit_reached")) {
    return "You’ve used all available Locks for this slate.";
  }
  if (normalized.includes("football_futures_locked")) {
    return "Football Futures are locked. Your saved picks are preserved.";
  }
  return message;
}

function isFightLockRejection(error: unknown) {
  const message = readableError(error).toLowerCase();
  return message.includes("locked for this fight") || message.includes("closed for this fight");
}

function selectionsFromRows(rows: Awaited<ReturnType<PicksRepository["loadMyPicks"]>>) {
  return Object.fromEntries(rows.map((row) => [row.boutId, row.fighterSlug]));
}

function footballLocksFromRows(rows: Awaited<ReturnType<PicksRepository["loadMyPicks"]>>) {
  return Object.fromEntries(rows.map((row) => [row.boutId, row.isLock === true]));
}

export function PicksProvider({
  children,
  repository: suppliedRepository,
  sport = "mma",
  includeFootballSummary = false,
}: PropsWithChildren<{
  repository?: PicksRepository | null;
  sport?: PickSport;
  includeFootballSummary?: boolean;
}>) {
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
  const [footballLocks, setFootballLocks] = useState<Record<string, boolean>>({});
  const [footballFutures, setFootballFutures] = useState<FootballFuturesSnapshot | null>(null);
  const [groupProgress, setGroupProgress] = useState<PickEventMemberProgress[]>([]);
  const [underdogLock, setUnderdogLockState] = useState<UnderdogLock | null>(null);
  const [summary, setSummary] = useState<PickSummary>(emptyPickSummary);
  const [footballSummary, setFootballSummary] = useState<PickSummary | null>(null);
  const [history, setHistory] = useState<PickHistory>(emptyPickHistory);
  const [loading, setLoading] = useState(false);
  const [groupProgressLoading, setGroupProgressLoading] = useState(false);
  const [footballSummaryLoading, setFootballSummaryLoading] = useState(false);
  const [savingBoutId, setSavingBoutId] = useState<string | null>(null);
  const [savingLock, setSavingLock] = useState(false);
  const [savingFootballFutures, setSavingFootballFutures] = useState(false);
  const [error, setError] = useState("");
  const [groupProgressError, setGroupProgressError] = useState("");
  const [footballSummaryError, setFootballSummaryError] = useState("");

  useEffect(() => {
    profileIdRef.current = profileId;
    return () => {
      ++revisionRef.current;
      profileIdRef.current = null;
    };
  }, [profileId]);

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    const revision = ++revisionRef.current;

    if (!repository) {
      setEvent(null);
      setSelections({});
      setFootballLocks({});
      setFootballFutures(null);
      setGroupProgress([]);
      setUnderdogLockState(null);
      setSummary(emptyPickSummary);
      setFootballSummary(null);
      setHistory(emptyPickHistory);
      setLoading(false);
      setGroupProgressLoading(false);
      setFootballSummaryLoading(false);
      setError("Picks are not connected on this build.");
      setGroupProgressError("");
      setFootballSummaryError("Picks are not connected on this build.");
      return;
    }

    setLoading(true);
    try {
      const nextEvent = await repository.loadCurrentEvent(sport);
      if (revision !== revisionRef.current) return;
      setEvent(nextEvent);

      if (!expectedProfileId) {
        setSelections({});
        setFootballLocks({});
        setFootballFutures(null);
        setGroupProgress([]);
        setUnderdogLockState(null);
        setSummary(emptyPickSummary);
        setFootballSummary(null);
        setHistory(emptyPickHistory);
        setFootballSummaryLoading(false);
        setError("");
        setGroupProgressError("");
        setFootballSummaryError("");
        return;
      }

      const season = nextEvent?.season ?? new Date().getFullYear();
      setGroupProgressLoading(Boolean(nextEvent));
      if (sport === "mma" && includeFootballSummary) {
        setFootballSummaryLoading(true);
        void repository.loadMySummary(season, "football")
          .then((nextFootballSummary) => {
            if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return;
            setFootballSummary(nextFootballSummary);
            setFootballSummaryError("");
          })
          .catch((footballError: unknown) => {
            if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return;
            setFootballSummary(null);
            setFootballSummaryError(readableError(footballError));
          })
          .finally(() => {
            if (revision === revisionRef.current && profileIdRef.current === expectedProfileId) {
              setFootballSummaryLoading(false);
            }
          });
      } else if (sport === "mma") {
        setFootballSummary(null);
        setFootballSummaryLoading(false);
        setFootballSummaryError("");
      }
      const futuresRequest = nextEvent?.sport === "football" && repository.loadFootballFutures
        ? repository.loadFootballFutures(season)
        : Promise.resolve(null);
      const [rows, nextLock, nextSummary, nextHistory, nextFutures, progressResult] = await Promise.all([
        nextEvent ? repository.loadMyPicks(nextEvent.eventId) : Promise.resolve([]),
        nextEvent ? repository.loadMyUnderdogLock(nextEvent.eventId) : Promise.resolve(null),
        repository.loadMySummary(season, sport),
        repository.loadMyHistory(season, sport),
        futuresRequest,
        nextEvent
          ? loadPickGroupProgress(nextEvent.eventId)
              .then((value) => ({ value, error: "" }))
              .catch((progressError: unknown) => ({ value: [], error: readableError(progressError) }))
          : Promise.resolve({ value: [], error: "" }),
      ]);
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return;
      setSelections(selectionsFromRows(rows));
      setFootballLocks(footballLocksFromRows(rows));
      setFootballFutures(nextFutures);
      setGroupProgress(progressResult.value);
      setGroupProgressError(progressResult.error);
      setUnderdogLockState(nextLock);
      setSummary(nextSummary);
      if (sport === "football") {
        setFootballSummary(nextSummary);
        setFootballSummaryLoading(false);
        setFootballSummaryError("");
      }
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
  }, [includeFootballSummary, profileId, repository, sport]);

  useEffect(() => {
    setSavingBoutId(null);
    setSavingLock(false);
    setSavingFootballFutures(false);
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
    const bout = event.bouts.find((item) => item.boutId === boutId);
    if (!bout) {
      setError("That fight is no longer on the current Picks card.");
      return;
    }
    if (pickBoutLocked(event, bout)) {
      setError("This fight is locked. Your saved pick is preserved.");
      return;
    }

    setSavingBoutId(boutId);
    try {
      const saved = event.sport === "football"
        ? await repository.savePick(event.eventId, boutId, fighterSlug, footballLocks[boutId] === true)
        : await repository.savePick(event.eventId, boutId, fighterSlug);
      const [nextLock, nextSummary, nextProgress] = await Promise.all([
        repository.loadMyUnderdogLock(event.eventId),
        repository.loadMySummary(event.season, sport),
        loadPickGroupProgress(event.eventId).catch(() => groupProgress),
      ]);
      if (profileIdRef.current !== expectedProfileId) return;
      setSelections((current) => ({ ...current, [saved.boutId]: saved.fighterSlug }));
      if (event.sport === "football") {
        setFootballLocks((current) => ({ ...current, [saved.boutId]: saved.isLock === true }));
        setFootballSummary(nextSummary);
        setFootballSummaryError("");
      }
      setGroupProgress(nextProgress);
      setGroupProgressError("");
      setUnderdogLockState(nextLock);
      setSummary(nextSummary);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      if (isFightLockRejection(nextError)) {
        await refresh();
        if (profileIdRef.current === expectedProfileId) setError("This fight just locked. Your saved pick was refreshed.");
      } else {
        setError(readableError(nextError));
      }
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingBoutId(null);
    }
  }, [event, footballLocks, groupProgress, identity.openDialog, profileId, refresh, repository, sport]);

  const setFootballLock = useCallback(async (boutId: string, isLock: boolean) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) {
      identity.openDialog();
      return;
    }
    if (!repository || !event || event.sport !== "football") {
      setError("Football Locks are not available on this Picks card.");
      return;
    }
    const bout = event.bouts.find((item) => item.boutId === boutId);
    if (!bout) {
      setError("That game is no longer on the current Picks slate.");
      return;
    }
    if (pickBoutLocked(event, bout)) {
      setError("This game is locked. Your saved Lock is preserved.");
      return;
    }
    const fighterSlug = selections[boutId];
    if (!fighterSlug) {
      setError("Pick a team before making it a Lock.");
      return;
    }
    if ((footballLocks[boutId] === true) === isLock) return;

    setSavingBoutId(boutId);
    try {
      const saved = await repository.savePick(event.eventId, boutId, fighterSlug, isLock);
      if (profileIdRef.current !== expectedProfileId) return;
      setSelections((current) => ({ ...current, [saved.boutId]: saved.fighterSlug }));
      setFootballLocks((current) => ({ ...current, [saved.boutId]: saved.isLock === true }));
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      if (isFightLockRejection(nextError)) {
        await refresh();
        if (profileIdRef.current === expectedProfileId) setError("This game just locked. Your saved Lock was refreshed.");
      } else {
        setError(readableError(nextError));
      }
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingBoutId(null);
    }
  }, [event, footballLocks, identity.openDialog, profileId, refresh, repository, selections]);

  const saveFootballFutures = useCallback(async (nextPicks: FootballFuturesPicks) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) return identity.openDialog();
    if (!repository || !event || event.sport !== "football") {
      setError("Football Futures are not available on this Picks card.");
      return;
    }
    const saveFutures = repository.saveFootballFutures;
    const loadFutures = repository.loadFootballFutures;
    if (!saveFutures || !loadFutures) {
      setError("Football Futures are not connected on this build.");
      return;
    }
    if (footballFutures?.locked) {
      setError("Football Futures are locked. Your saved picks are preserved.");
      return;
    }
    setSavingFootballFutures(true);
    try {
      const saved = await saveFutures(event.season, nextPicks);
      if (profileIdRef.current !== expectedProfileId) return;
      setFootballFutures(saved);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
      try {
        const latest = await loadFutures(event.season);
        if (profileIdRef.current === expectedProfileId) setFootballFutures(latest);
      } catch { /* preserve the save error */ }
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingFootballFutures(false);
    }
  }, [event, footballFutures?.locked, identity.openDialog, profileId, repository]);

  const setUnderdogLock = useCallback(async (boutId: string, fighterSlug: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId) return identity.openDialog();
    if (!repository || !event) {
      setError("Underdog Lock is not connected on this build.");
      return;
    }
    const bout = event.bouts.find((item) => item.boutId === boutId);
    if (!bout || pickBoutLocked(event, bout)) {
      setError("Underdog Lock is closed for this fight.");
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
      if (profileIdRef.current !== expectedProfileId) return;
      if (isFightLockRejection(nextError)) {
        await refresh();
        if (profileIdRef.current === expectedProfileId) setError("This fight just locked. Your Underdog Lock was refreshed.");
      } else {
        setError(readableError(nextError));
      }
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingLock(false);
    }
  }, [event, groupProgress, identity.openDialog, profileId, refresh, repository]);

  const clearUnderdogLock = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || !event || !underdogLock) return;
    const bout = event.bouts.find((item) => item.boutId === underdogLock.boutId);
    if (!bout || pickBoutLocked(event, bout)) {
      setError("Underdog Lock is closed for this fight.");
      return;
    }
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
      if (profileIdRef.current !== expectedProfileId) return;
      if (isFightLockRejection(nextError)) {
        await refresh();
        if (profileIdRef.current === expectedProfileId) setError("This fight just locked. Your Underdog Lock was refreshed.");
      } else {
        setError(readableError(nextError));
      }
    } finally {
      if (profileIdRef.current === expectedProfileId) setSavingLock(false);
    }
  }, [event, groupProgress, profileId, refresh, repository, underdogLock]);

  return (
    <PicksContext.Provider value={{
      configured: Boolean(repository),
      loading,
      groupProgressLoading,
      footballSummaryLoading,
      savingBoutId,
      savingLock,
      savingFootballFutures,
      error,
      groupProgressError,
      footballSummaryError,
      event,
      selections,
      footballLocks,
      footballFutures,
      groupProgress,
      underdogLock,
      summary,
      footballSummary,
      history,
      refresh,
      setPick,
      setFootballLock,
      saveFootballFutures,
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
