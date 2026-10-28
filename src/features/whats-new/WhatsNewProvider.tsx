import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useIdentity } from "../identity/IdentityProvider";
import type { WhatsNewItem } from "./whatsNewModel";
import {
  createWhatsNewRepository,
  type WhatsNewRepository,
} from "./whatsNewRepository";

export type WhatsNewStatus = "idle" | "loading" | "ready" | "unconfigured" | "error";

interface WhatsNewContextValue {
  status: WhatsNewStatus;
  items: WhatsNewItem[];
  activeItems: WhatsNewItem[];
  archiveItems: WhatsNewItem[];
  latestItem: WhatsNewItem | null;
  unreadCount: number;
  error: string;
  refresh: () => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
}

const WhatsNewContext = createContext<WhatsNewContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load What's New.";
}

export function WhatsNewProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: WhatsNewRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const revisionRef = useRef(0);
  const [repository] = useState<WhatsNewRepository | null>(() => (
    suppliedRepository === undefined ? createWhatsNewRepository() : suppliedRepository
  ));
  const [status, setStatus] = useState<WhatsNewStatus>("idle");
  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestItemId, setLatestItemId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    profileIdRef.current = profileId;
    return () => {
      ++revisionRef.current;
      profileIdRef.current = null;
    };
  }, [profileId]);

  const loadSnapshot = useCallback(async (showLoading = false) => {
    if (!repository) {
      setStatus("unconfigured");
      return false;
    }
    const revision = ++revisionRef.current;
    const expectedProfileId = profileIdRef.current;
    if (showLoading) setStatus("loading");

    try {
      const snapshot = await repository.loadSnapshot();
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      setItems(snapshot.items);
      setUnreadCount(snapshot.unreadCount);
      setLatestItemId(snapshot.latestItemId);
      setError("");
      setStatus("ready");
      return true;
    } catch (nextError) {
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      setStatus("error");
      setError(readableError(nextError));
      return false;
    }
  }, [repository]);

  useEffect(() => {
    ++revisionRef.current;
    setItems([]);
    setUnreadCount(0);
    setLatestItemId(null);
    setError("");

    if (identity.status === "loading") {
      setStatus("loading");
      return;
    }

    void loadSnapshot(true);
  }, [identity.status, loadSnapshot, profileId]);

  useEffect(() => {
    if (!repository || !profileId) return undefined;
    return repository.subscribe(() => void loadSnapshot(false));
  }, [loadSnapshot, profileId, repository]);

  useEffect(() => {
    const refreshVisibleData = () => void loadSnapshot(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshVisibleData();
    };

    window.addEventListener("focus", refreshVisibleData);
    window.addEventListener("online", refreshVisibleData);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refreshVisibleData);
      window.removeEventListener("online", refreshVisibleData);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadSnapshot]);

  const markAllRead = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || !latestItemId || unreadCount === 0) return true;

    try {
      const nextUnreadCount = await repository.markRead(latestItemId);
      if (profileIdRef.current !== expectedProfileId) return false;
      setUnreadCount(nextUnreadCount);
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setError("");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setError(readableError(nextError));
      return false;
    }
  }, [latestItemId, profileId, repository, unreadCount]);

  const activeItems = useMemo(
    () => items.filter((item) => item.lifecycle === "active"),
    [items],
  );
  const archiveItems = useMemo(
    () => items.filter((item) => item.lifecycle === "archive"),
    [items],
  );

  return (
    <WhatsNewContext.Provider value={{
      status,
      items,
      activeItems,
      archiveItems,
      latestItem: items[0] ?? null,
      unreadCount,
      error,
      refresh: () => loadSnapshot(false),
      markAllRead,
    }}>
      {children}
    </WhatsNewContext.Provider>
  );
}

export function useWhatsNew() {
  const value = useContext(WhatsNewContext);
  if (!value) throw new Error("useWhatsNew must be used inside WhatsNewProvider");
  return value;
}
