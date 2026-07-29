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
  type WarRoomAccessMode,
  type WarRoomCursor,
  type WarRoomMember,
  type WarRoomMessage,
  type WarRoomRole,
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

interface WarRoomContextValue {
  configured: boolean;
  status: WarRoomStatus;
  accessMode: WarRoomAccessMode | null;
  role: WarRoomRole | null;
  loading: boolean;
  loadingOlder: boolean;
  posting: boolean;
  deletingMessageId: string | null;
  error: string;
  messages: WarRoomMessage[];
  members: WarRoomMember[];
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadOlder: () => Promise<void>;
  postMessage: (body: string, parentMessageId?: string | null) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
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
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const [status, setStatus] = useState<WarRoomStatus>("idle");
  const [accessMode, setAccessMode] = useState<WarRoomAccessMode | null>(null);
  const [role, setRole] = useState<WarRoomRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [posting, setPosting] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<WarRoomMessage[]>([]);
  const [members, setMembers] = useState<WarRoomMember[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<WarRoomCursor | null>(null);

  const applySnapshot = useCallback((snapshot: Awaited<ReturnType<WarRoomRepository["loadSnapshot"]>>) => {
    setRole(snapshot.role);
    setMessages(snapshot.messages);
    setMembers(snapshot.members);
    setHasMore(snapshot.hasMore);
    setNextCursor(snapshot.nextCursor);
    setAccessMode("eligible");
    setStatus("eligible");
    setError("");
  }, []);

  useEffect(() => {
    const revision = ++revisionRef.current;
    setMessages([]);
    setMembers([]);
    setHasMore(false);
    setNextCursor(null);
    setRole(null);
    setError("");

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
    setLoading(true);
    void repository.getAccess()
      .then(async (access) => {
        if (revision !== revisionRef.current || profileIdRef.current !== profileId) return;
        setAccessMode(access.mode);
        if (access.mode !== "eligible") {
          setStatus(access.mode);
          return;
        }
        setRole(access.role);
        const snapshot = await repository.loadSnapshot();
        if (revision !== revisionRef.current || profileIdRef.current !== profileId) return;
        applySnapshot(snapshot);
      })
      .catch((nextError) => {
        if (revision !== revisionRef.current || profileIdRef.current !== profileId) return;
        setStatus("error");
        setError(readableError(nextError));
      })
      .finally(() => {
        if (revision === revisionRef.current && profileIdRef.current === profileId) setLoading(false);
      });
  }, [applySnapshot, identity.status, profileId, repository]);

  const refresh = useCallback(async () => {
    const expectedProfileId = profileId;
    if (!expectedProfileId || !repository || status !== "eligible") return;
    setLoading(true);
    try {
      const snapshot = await repository.loadSnapshot();
      if (profileIdRef.current !== expectedProfileId) return;
      applySnapshot(snapshot);
    } catch (nextError) {
      if (profileIdRef.current !== expectedProfileId) return;
      setError(readableError(nextError));
    } finally {
      if (profileIdRef.current === expectedProfileId) setLoading(false);
    }
  }, [applySnapshot, profileId, repository, status]);

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

  return (
    <WarRoomContext.Provider value={{
      configured: Boolean(repository),
      status,
      accessMode,
      role,
      loading,
      loadingOlder,
      posting,
      deletingMessageId,
      error,
      messages,
      members,
      hasMore,
      refresh,
      loadOlder,
      postMessage,
      deleteMessage,
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
