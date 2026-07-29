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
import type { NotificationItem } from "./notificationModel";
import {
  createNotificationRepository,
  type NotificationRepository,
} from "./notificationRepository";

export type NotificationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "signed-out"
  | "unconfigured"
  | "error";

interface NotificationContextValue {
  status: NotificationStatus;
  items: NotificationItem[];
  unreadCount: number;
  error: string;
  refresh: () => Promise<boolean>;
  markRead: (notificationId: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load notifications.";
}

export function NotificationProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: NotificationRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const revisionRef = useRef(0);
  const [repository] = useState<NotificationRepository | null>(() => (
    suppliedRepository === undefined ? createNotificationRepository() : suppliedRepository
  ));
  const [status, setStatus] = useState<NotificationStatus>("idle");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const loadSnapshot = useCallback(async (showLoading = false) => {
    const expectedProfileId = profileIdRef.current;
    if (!expectedProfileId) {
      setItems([]);
      setUnreadCount(0);
      setError("");
      setStatus("signed-out");
      return true;
    }
    if (!repository) {
      setStatus("unconfigured");
      return false;
    }

    const revision = ++revisionRef.current;
    if (showLoading) setStatus("loading");

    try {
      const snapshot = await repository.loadSnapshot();
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      setItems(snapshot.items);
      setUnreadCount(snapshot.unreadCount);
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
    setError("");

    if (identity.status === "loading") {
      setStatus("loading");
      return;
    }

    if (!profileId) {
      setStatus("signed-out");
      return;
    }

    void loadSnapshot(true);
  }, [identity.status, loadSnapshot, profileId]);

  useEffect(() => {
    if (!repository || !profileId) return undefined;
    return repository.subscribe(profileId, () => void loadSnapshot(false));
  }, [loadSnapshot, profileId, repository]);

  useEffect(() => {
    if (!profileId) return undefined;
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
  }, [loadSnapshot, profileId]);

  const markRead = useCallback(async (notificationId: string) => {
    const expectedProfileId = profileIdRef.current;
    if (!expectedProfileId || !repository) return false;

    try {
      const nextUnreadCount = await repository.markRead(notificationId);
      if (profileIdRef.current !== expectedProfileId) return false;
      setUnreadCount(nextUnreadCount);
      setItems((current) => current.map((item) => (
        item.id === notificationId ? { ...item, isRead: true } : item
      )));
      setError("");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setError(readableError(nextError));
      return false;
    }
  }, [repository]);

  const markAllRead = useCallback(async () => {
    const expectedProfileId = profileIdRef.current;
    if (!expectedProfileId || !repository || unreadCount === 0) return true;

    try {
      const nextUnreadCount = await repository.markAllRead();
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
  }, [repository, unreadCount]);

  return (
    <NotificationContext.Provider value={{
      status,
      items,
      unreadCount,
      error,
      refresh: () => loadSnapshot(false),
      markRead,
      markAllRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error("useNotifications must be used inside NotificationProvider");
  return value;
}
