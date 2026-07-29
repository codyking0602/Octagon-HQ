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
  mergeWarRoomMessages,
  mentionedMemberIds,
  type WarRoomAccess,
  type WarRoomAccessMode,
  type WarRoomAccessProfile,
  type WarRoomCursor,
  type WarRoomMember,
  type WarRoomMessage,
  type WarRoomRealtimeStatus,
  type WarRoomRole,
  type WarRoomSnapshot,
} from "./warRoomModel";
import {
  createWarRoomRepository,
  type WarRoomRepository,
} from "./warRoomRepository";

export type WarRoomStatus =
  | "idle"
  | "checking"
  | "locked"
  | "invite"
  | "eligible"
  | "unconfigured"
  | "error";

export type WarRoomInviteStatus =
  | "idle"
  | "checking"
  | "ready"
  | "invalid"
  | "joining"
  | "joined"
  | "error";

export type WarRoomAccessRosterStatus = "idle" | "loading" | "ready" | "error";

interface WarRoomContextValue {
  configured: boolean;
  status: WarRoomStatus;
  accessMode: WarRoomAccessMode | null;
  role: WarRoomRole | null;
  unreadCount: number;
  realtimeStatus: WarRoomRealtimeStatus;
  loading: boolean;
  loadingOlder: boolean;
  posting: boolean;
  deletingMessageId: string | null;
  error: string;
  messages: WarRoomMessage[];
  members: WarRoomMember[];
  hasMore: boolean;
  inviteStatus: WarRoomInviteStatus;
  inviteAccess: WarRoomAccess | null;
  inviteError: string;
  accessRoster: WarRoomAccessProfile[];
  accessRosterStatus: WarRoomAccessRosterStatus;
  accessRosterError: string;
  accessSavingProfileId: string | null;
  loadOlder: () => Promise<void>;
  postMessage: (body: string, parentMessageId?: string | null) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  markReadThroughLatest: () => Promise<boolean>;
  checkInvite: (inviteCode: string) => Promise<WarRoomAccess | null>;
  joinWithInvite: (inviteCode: string) => Promise<boolean>;
  clearInvite: () => void;
  loadAccessRoster: () => Promise<boolean>;
  setProfileAccess: (profileId: string, enabled: boolean) => Promise<boolean>;
  clearAccessRoster: () => void;
}

const WarRoomContext = createContext<WarRoomContextValue | null>(null);

function readableError(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Octagon HQ could not load the War Room.";
}

export function WarRoomProvider({
  children,
  repository: suppliedRepository,
}: PropsWithChildren<{ repository?: WarRoomRepository | null }>) {
  const identity = useIdentity();
  const profileId = identity.profile?.id ?? null;
  const [repository] = useState<WarRoomRepository | null>(() => (
    suppliedRepository === undefined ? createWarRoomRepository() : suppliedRepository
  ));
  const revisionRef = useRef(0);
  const markingReadRef = useRef(false);
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;

  const [status, setStatus] = useState<WarRoomStatus>("idle");
  const [accessMode, setAccessMode] = useState<WarRoomAccessMode | null>(null);
  const [role, setRole] = useState<WarRoomRole | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<WarRoomRealtimeStatus>("idle");
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<WarRoomMessage[]>([]);
  const [members, setMembers] = useState<WarRoomMember[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<WarRoomCursor | null>(null);
  const [inviteStatus, setInviteStatus] = useState<WarRoomInviteStatus>("idle");
  const [inviteAccess, setInviteAccess] = useState<WarRoomAccess | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [accessRoster, setAccessRoster] = useState<WarRoomAccessProfile[]>([]);
  const [accessRosterStatus, setAccessRosterStatus] = useState<WarRoomAccessRosterStatus>("idle");
  const [accessRosterError, setAccessRosterError] = useState("");
  const [accessSavingProfileId, setAccessSavingProfileId] = useState<string | null>(null);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setMembers([]);
    setHasMore(false);
    setNextCursor(null);
    setRole(null);
    setUnreadCount(0);
    setLatestMessageId(null);
  }, []);

  const clearAccessRoster = useCallback(() => {
    setAccessRoster([]);
    setAccessRosterStatus("idle");
    setAccessRosterError("");
    setAccessSavingProfileId(null);
  }, []);

  const applySnapshot = useCallback((snapshot: WarRoomSnapshot, merge = false) => {
    setRole(snapshot.role);
    setMessages((current) => (
      merge ? mergeWarRoomMessages(current, snapshot.messages) : snapshot.messages
    ));
    setMembers(snapshot.members);
    setHasMore(snapshot.hasMore);
    setNextCursor(snapshot.nextCursor);
    setUnreadCount(snapshot.unreadCount);
    setLatestMessageId(snapshot.latestMessageId);
    setAccessMode("eligible");
    setStatus("eligible");
    setError("");
  }, []);

  const clearInvite = useCallback(() => {
    setInviteStatus("idle");
    setInviteAccess(null);
    setInviteError("");
  }, []);

  const recheckAccess = useCallback(async (showLoading = false) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository) return false;
    const revision = ++revisionRef.current;
    if (showLoading) setLoading(true);

    try {
      const access = await repository.getAccess();
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      setAccessMode(access.mode);

      if (access.mode !== "eligible") {
        clearConversation();
        clearAccessRoster();
        setStatus(access.mode);
        setRealtimeStatus("idle");
        setError("");
        return true;
      }

      setRole(access.role);
      setUnreadCount(access.unreadCount);
      const snapshot = await repository.loadSnapshot();
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      applySnapshot(snapshot);
      if (snapshot.role !== "admin") clearAccessRoster();
      return true;
    } catch (nextError) {
      if (revision !== revisionRef.current || profileIdRef.current !== expectedProfileId) return false;
      setStatus("error");
      setError(readableError(nextError));
      return false;
    } finally {
      if (showLoading && revision === revisionRef.current && profileIdRef.current === expectedProfileId) {
        setLoading(false);
      }
    }
  }, [applySnapshot, clearAccessRoster, clearConversation, profileId, repository]);

  useEffect(() => {
    ++revisionRef.current;
    clearConversation();
    clearAccessRoster();
    setRealtimeStatus("idle");
    setError("");
    setLoading(false);
    clearInvite();

    if (identity.status === "loading") {
      setStatus("checking");
      setAccessMode(null);
      return;
    }

    if (!profileId) {
      setStatus("locked");
      setAccessMode("locked");
      return;
    }

    if (!repository) {
      setStatus("unconfigured");
      setAccessMode(null);
      return;
    }

    setStatus("checking");
    setAccessMode(null);
    void recheckAccess(true);
  }, [clearAccessRoster, clearConversation, clearInvite, identity.status, profileId, repository, recheckAccess]);

  const syncLatest = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || status !== "eligible") return;
    try {
      const snapshot = await repository.loadSnapshot();
      if (profileIdRef.current !== expectedProfileId) return;
      applySnapshot(snapshot, true);
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    }
  }, [applySnapshot, profileId, repository, status]);

  useEffect(() => {
    if (!repository || !profileId) return undefined;
    return repository.subscribeAccess(profileId, () => void recheckAccess(false));
  }, [profileId, recheckAccess, repository]);

  useEffect(() => {
    if (!repository || status !== "eligible") {
      setRealtimeStatus("idle");
      return undefined;
    }

    const unsubscribe = repository.subscribe(
      () => void syncLatest(),
      (nextStatus) => {
        setRealtimeStatus(nextStatus);
        if (nextStatus === "connected") void syncLatest();
      },
    );

    return () => unsubscribe();
  }, [repository, status, syncLatest]);

  useEffect(() => {
    if (status !== "eligible") return undefined;
    const refreshVisibleData = () => void syncLatest();
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
  }, [status, syncLatest]);

  const loadOlder = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || !nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const snapshot = await repository.loadSnapshot(nextCursor);
      if (profileIdRef.current !== expectedProfileId) return;
      setMessages((current) => mergeWarRoomMessages(current, snapshot.messages));
      setMembers(snapshot.members);
      setHasMore(snapshot.hasMore);
      setNextCursor(snapshot.nextCursor);
      setUnreadCount(snapshot.unreadCount);
      setLatestMessageId(snapshot.latestMessageId);
      setError("");
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoadingOlder(false);
    }
  }, [loadingOlder, nextCursor, profileId, repository]);

  const postMessage = useCallback(async (body: string, parentMessageId: string | null = null) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || status !== "eligible" || posting) return false;
    setPosting(true);
    try {
      const mentionIds = mentionedMemberIds(body, members);
      const saved = await repository.postMessage(body, parentMessageId, mentionIds);
      if (profileIdRef.current !== expectedProfileId) return false;
      setMessages((current) => mergeWarRoomMessages(current, [saved]));
      setLatestMessageId(saved.id);
      setError("");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setError(readableError(nextError));
      return false;
    } finally {
      if (profileIdRef.current === expectedProfileId) setPosting(false);
    }
  }, [members, posting, profileId, repository, status]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || status !== "eligible" || deletingMessageId) return false;
    setDeletingMessageId(messageId);
    try {
      const saved = await repository.deleteMessage(messageId);
      if (profileIdRef.current !== expectedProfileId) return false;
      setMessages((current) => mergeWarRoomMessages(current, [saved]));
      setError("");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setError(readableError(nextError));
      return false;
    } finally {
      if (profileIdRef.current === expectedProfileId) setDeletingMessageId(null);
    }
  }, [deletingMessageId, profileId, repository, status]);

  const markReadThroughLatest = useCallback(async () => {
    const expectedProfileId = profileId;
    if (
      !expectedProfileId
      || !repository
      || status !== "eligible"
      || !latestMessageId
      || unreadCount === 0
      || markingReadRef.current
    ) return true;

    markingReadRef.current = true;
    try {
      const receipt = await repository.markRead(latestMessageId);
      if (profileIdRef.current !== expectedProfileId) return false;
      setUnreadCount(receipt.unreadCount);
      setError("");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setError(readableError(nextError));
      return false;
    } finally {
      markingReadRef.current = false;
    }
  }, [latestMessageId, profileId, repository, status, unreadCount]);

  const checkInvite = useCallback(async (inviteCode: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository) {
      setInviteStatus("error");
      setInviteAccess(null);
      setInviteError("Sign in to verify this War Room invite.");
      return null;
    }

    setInviteStatus("checking");
    setInviteAccess(null);
    setInviteError("");
    try {
      const access = await repository.getAccess(inviteCode);
      if (profileIdRef.current !== expectedProfileId) return null;
      setInviteAccess(access);
      setInviteStatus(access.mode === "locked" ? "invalid" : "ready");
      return access;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return null;
      setInviteStatus("error");
      setInviteAccess(null);
      setInviteError(readableError(nextError));
      return null;
    }
  }, [profileId, repository]);

  const joinWithInvite = useCallback(async (inviteCode: string) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository) return false;
    setInviteStatus("joining");
    setInviteError("");

    try {
      const joined = await repository.joinWithInvite(inviteCode);
      if (profileIdRef.current !== expectedProfileId) return false;
      setAccessMode("eligible");
      setRole(joined.role);
      setUnreadCount(joined.unreadCount);
      setStatus("checking");
      const snapshot = await repository.loadSnapshot();
      if (profileIdRef.current !== expectedProfileId) return false;
      applySnapshot(snapshot);
      setInviteAccess({
        mode: "eligible",
        eligible: true,
        role: joined.role,
        unreadCount: joined.unreadCount,
      });
      setInviteStatus("joined");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setInviteStatus("error");
      setInviteError(readableError(nextError));
      return false;
    }
  }, [applySnapshot, profileId, repository]);

  const loadAccessRoster = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || role !== "admin") return false;
    setAccessRosterStatus("loading");
    setAccessRosterError("");
    try {
      const roster = await repository.loadAccessRoster();
      if (profileIdRef.current !== expectedProfileId) return false;
      setAccessRoster(roster);
      setAccessRosterStatus("ready");
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setAccessRosterStatus("error");
      setAccessRosterError(readableError(nextError));
      return false;
    }
  }, [profileId, repository, role]);

  const setProfileAccess = useCallback(async (targetProfileId: string, enabled: boolean) => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || role !== "admin" || accessSavingProfileId) return false;
    setAccessSavingProfileId(targetProfileId);
    setAccessRosterError("");
    try {
      const saved = await repository.setProfileAccess(targetProfileId, enabled);
      if (profileIdRef.current !== expectedProfileId) return false;
      setAccessRoster((current) => current.map((profile) => (
        profile.id === saved.id ? saved : profile
      )));
      await syncLatest();
      return true;
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return false;
      setAccessRosterError(readableError(nextError));
      return false;
    } finally {
      if (profileIdRef.current === expectedProfileId) setAccessSavingProfileId(null);
    }
  }, [accessSavingProfileId, profileId, repository, role, syncLatest]);

  return (
    <WarRoomContext.Provider value={{
      configured: Boolean(repository),
      status,
      accessMode,
      role,
      unreadCount,
      realtimeStatus,
      loading,
      loadingOlder,
      posting,
      deletingMessageId,
      error,
      messages,
      members,
      hasMore,
      inviteStatus,
      inviteAccess,
      inviteError,
      accessRoster,
      accessRosterStatus,
      accessRosterError,
      accessSavingProfileId,
      loadOlder,
      postMessage,
      deleteMessage,
      markReadThroughLatest,
      checkInvite,
      joinWithInvite,
      clearInvite,
      loadAccessRoster,
      setProfileAccess,
      clearAccessRoster,
    }}>
      {children}
    </WarRoomContext.Provider>
  );
}

export function useWarRoom() {
  const value = useContext(WarRoomContext);
  if (!value) throw new Error("useWarRoom must be used inside WarRoomProvider");
  return value;
}
