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
  defaultNotificationPreferences,
  initialNotificationDeviceReadiness,
  type NotificationDeviceReadiness,
  type NotificationItem,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "./notificationModel";
import {
  inspectNotificationDeviceReadiness,
  promptNotificationAppInstall,
  subscribeNotificationDeviceReadiness,
} from "./notificationDeviceReadiness";
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

export type NotificationPreferenceStatus =
  | "idle"
  | "loading"
  | "ready"
  | "saving"
  | "signed-out"
  | "unconfigured"
  | "error";

interface NotificationContextValue {
  status: NotificationStatus;
  items: NotificationItem[];
  unreadCount: number;
  error: string;
  preferences: NotificationPreferences;
  preferenceStatus: NotificationPreferenceStatus;
  deviceReadiness: NotificationDeviceReadiness;
  refresh: () => Promise<boolean>;
  markRead: (notificationId: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
  updatePreference: (key: NotificationPreferenceKey, enabled: boolean) => Promise<boolean>;
  installApp: () => Promise<boolean>;
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
  const preferenceRevisionRef = useRef(0);
  const [repository] = useState<NotificationRepository | null>(() => (
    suppliedRepository === undefined ? createNotificationRepository() : suppliedRepository
  ));
  const [status, setStatus] = useState<NotificationStatus>("idle");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;
  const [preferenceStatus, setPreferenceStatus] = useState<NotificationPreferenceStatus>("idle");
  const [deviceReadiness, setDeviceReadiness] = useState<NotificationDeviceReadiness>(
    initialNotificationDeviceReadiness,
  );

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

  const loadPreferences = useCallback(async (showLoading = false) => {
    const expectedProfileId = profileIdRef.current;
    if (!expectedProfileId) {
      setPreferences(defaultNotificationPreferences);
      setPreferenceStatus("signed-out");
      return true;
    }
    if (!repository) {
      setPreferenceStatus("unconfigured");
      return false;
    }

    const revision = ++preferenceRevisionRef.current;
    if (showLoading) setPreferenceStatus("loading");

    try {
      const nextPreferences = await repository.loadPreferences();
      if (
        revision !== preferenceRevisionRef.current
        || profileIdRef.current !== expectedProfileId
      ) return false;
      setPreferences(nextPreferences);
      setError("");
      setPreferenceStatus("ready");
      return true;
    } catch (nextError) {
      if (
        revision !== preferenceRevisionRef.current
        || profileIdRef.current !== expectedProfileId
      ) return false;
      setPreferenceStatus("error");
      setError(readableError(nextError));
      return false;
    }
  }, [repository]);

  const refreshDeviceReadiness = useCallback(async () => {
    setDeviceReadiness((current) => ({ ...current, status: "checking" }));
    try {
      setDeviceReadiness(await inspectNotificationDeviceReadiness());
      return true;
    } catch {
      setDeviceReadiness((current) => ({ ...current, status: "error" }));
      return false;
    }
  }, []);

  useEffect(() => {
    void refreshDeviceReadiness();
    return subscribeNotificationDeviceReadiness(() => {
      void refreshDeviceReadiness();
    });
  }, [refreshDeviceReadiness]);

  useEffect(() => {
    ++revisionRef.current;
    ++preferenceRevisionRef.current;
    setItems([]);
    setUnreadCount(0);
    setError("");
    setPreferences(defaultNotificationPreferences);

    if (identity.status === "loading") {
      setStatus("loading");
      setPreferenceStatus("loading");
      return;
    }

    if (!profileId) {
      setStatus("signed-out");
      setPreferenceStatus("signed-out");
      return;
    }

    void loadSnapshot(true);
    void loadPreferences(true);
  }, [identity.status, loadPreferences, loadSnapshot, profileId]);

  useEffect(() => {
    if (!repository || !profileId) return undefined;
    return repository.subscribe(profileId, () => void loadSnapshot(false));
  }, [loadSnapshot, profileId, repository]);

  useEffect(() => {
    if (!profileId) return undefined;
    const refreshVisibleData = () => {
      void loadSnapshot(false);
      void loadPreferences(false);
      void refreshDeviceReadiness();
    };
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
  }, [loadPreferences, loadSnapshot, profileId, refreshDeviceReadiness]);

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

  const updatePreference = useCallback(async (
    key: NotificationPreferenceKey,
    enabled: boolean,
  ) => {
    const expectedProfileId = profileIdRef.current;
    if (!expectedProfileId || !repository) return false;

    const previousPreferences = preferencesRef.current;
    const nextPreferences: NotificationPreferences = {
      ...previousPreferences,
      [key]: enabled,
      criticalActions: true,
    };
    const revision = ++preferenceRevisionRef.current;
    setPreferences(nextPreferences);
    setPreferenceStatus("saving");

    try {
      const savedPreferences = await repository.savePreferences(nextPreferences);
      if (
        revision !== preferenceRevisionRef.current
        || profileIdRef.current !== expectedProfileId
      ) return false;
      setPreferences(savedPreferences);
      setPreferenceStatus("ready");
      setError("");
      return true;
    } catch (nextError) {
      if (
        revision !== preferenceRevisionRef.current
        || profileIdRef.current !== expectedProfileId
      ) return false;
      setPreferences(previousPreferences);
      setPreferenceStatus("error");
      setError(readableError(nextError));
      return false;
    }
  }, [repository]);

  const installApp = useCallback(async () => {
    try {
      const installed = await promptNotificationAppInstall();
      await refreshDeviceReadiness();
      return installed;
    } catch {
      await refreshDeviceReadiness();
      return false;
    }
  }, [refreshDeviceReadiness]);

  return (
    <NotificationContext.Provider value={{
      status,
      items,
      unreadCount,
      error,
      preferences,
      preferenceStatus,
      deviceReadiness,
      refresh: () => loadSnapshot(false),
      markRead,
      markAllRead,
      updatePreference,
      installApp,
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
