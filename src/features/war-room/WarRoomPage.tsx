import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, Navigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { memberProfilePath } from "../members/memberProfilesModel";
import type { WarRoomMember, WarRoomMessage } from "./warRoomModel";
import { useWarRoom } from "./WarRoomProvider";

function formatTimestamp(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function MessageBody({ body, mentions }: { body: string; mentions: WarRoomMember[] }) {
  const nodes = useMemo(() => {
    if (!mentions.length) return [body];
    const byName = new Map(mentions.map((member) => [member.displayName.toUpperCase(), member]));
    const names = [...byName.keys()].sort((left, right) => right.length - left.length);
    const expression = new RegExp(`@(${names.map(escapeRegExp).join("|")})(?=$|[^A-Z0-9])`, "gi");
    const output: ReactNode[] = [];
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = expression.exec(body))) {
      if (match.index > cursor) output.push(body.slice(cursor, match.index));
      const member = byName.get((match[1] ?? "").toUpperCase());
      if (member) {
        output.push(
          <Link key={`${member.id}-${match.index}`} to={memberProfilePath(member.displayName)}>
            @{body.slice(match.index + 1, expression.lastIndex)}
          </Link>,
        );
      } else {
        output.push(match[0]);
      }
      cursor = expression.lastIndex;
    }
    if (cursor < body.length) output.push(body.slice(cursor));
    return output;
  }, [body, mentions]);

  return <>{nodes}</>;
}

function MemberAvatar({ member }: { member: WarRoomMember }) {
  return (
    <span className="war-room-avatar" aria-hidden="true">
      {member.avatarPhotoData ? <img src={member.avatarPhotoData} alt="" /> : member.initials}
    </span>
  );
}

function activeMention(body: string, cursor: number) {
  const before = body.slice(0, cursor);
  const match = before.match(/(^|[\s(])@([^@\n]{0,24})$/);
  if (!match) return null;
  const at = before.lastIndexOf("@");
  return { start: at, query: (match[2] ?? "").trim().toUpperCase() };
}

function liveLabel(status: ReturnType<typeof useWarRoom>["realtimeStatus"]) {
  if (status === "connected") return "LIVE";
  if (status === "connecting") return "CONNECTING";
  if (status === "error") return "RECONNECTING";
  return "SYNC READY";
}

function WarRoomConversation() {
  const identity = useIdentity();
  const warRoom = useWarRoom();
  const feedRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const initialScrollRef = useRef(false);
  const previousLatestRef = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [cursor, setCursor] = useState(0);
  const [replyTo, setReplyTo] = useState<WarRoomMessage | null>(null);
  const [atLatest, setAtLatest] = useState(true);

  function updateAtLatest() {
    const feed = feedRef.current;
    if (!feed) return;
    const distance = feed.scrollHeight - feed.scrollTop - feed.clientHeight;
    setAtLatest(distance <= 72);
  }

  function jumpToLatest(behavior: ScrollBehavior = "smooth") {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    setAtLatest(true);
  }

  useEffect(() => {
    if (!initialScrollRef.current && !warRoom.loading && warRoom.messages.length) {
      initialScrollRef.current = true;
      jumpToLatest("auto");
    }
  }, [warRoom.loading, warRoom.messages.length]);

  const latestMessageId = warRoom.messages.at(-1)?.id ?? null;

  useEffect(() => {
    const previous = previousLatestRef.current;
    previousLatestRef.current = latestMessageId;
    if (previous && latestMessageId && previous !== latestMessageId && atLatest) {
      requestAnimationFrame(() => jumpToLatest("smooth"));
    }
  }, [atLatest, latestMessageId]);

  useEffect(() => {
    if (!atLatest || document.visibilityState !== "visible") return;
    void warRoom.markReadThroughLatest();
  }, [atLatest, latestMessageId, warRoom.markReadThroughLatest, warRoom.unreadCount]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && atLatest) {
        void warRoom.markReadThroughLatest();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [atLatest, warRoom.markReadThroughLatest]);

  const mention = activeMention(draft, cursor);
  const suggestions = mention ? warRoom.members
    .filter((member) => member.id !== identity.profile?.id)
    .filter((member) => !mention.query || member.displayName.includes(mention.query))
    .slice(0, 5) : [];

  function insertMention(member: WarRoomMember) {
    if (!mention) return;
    const replacement = `@${member.displayName} `;
    const next = `${draft.slice(0, mention.start)}${replacement}${draft.slice(cursor)}`;
    const nextCursor = mention.start + replacement.length;
    setDraft(next.slice(0, 500));
    setCursor(Math.min(nextCursor, 500));
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || warRoom.posting) return;
    const posted = await warRoom.postMessage(body, replyTo?.id ?? null);
    if (!posted) return;
    setDraft("");
    setCursor(0);
    setReplyTo(null);
    requestAnimationFrame(() => jumpToLatest("smooth"));
  }

  async function loadOlder() {
    const feed = feedRef.current;
    const previousHeight = feed?.scrollHeight ?? 0;
    const previousTop = feed?.scrollTop ?? 0;
    await warRoom.loadOlder();
    requestAnimationFrame(() => {
      if (!feed) return;
      feed.scrollTop = previousTop + feed.scrollHeight - previousHeight;
      updateAtLatest();
    });
  }

  return (
    <div className="page war-room-page">
      <section className="page-heading war-room-heading">
        <div>
          <p className="eyebrow">PRIVATE OCTAGON HQ CONVERSATION</p>
          <h1>War Room</h1>
          <p>One ongoing UFC conversation for the people inside HQ.</p>
        </div>
        <div className="war-room-heading__actions">
          <span className={`war-room-live is-${warRoom.realtimeStatus}`}>
            <i aria-hidden="true" />
            {liveLabel(warRoom.realtimeStatus)}
          </span>
          <button type="button" onClick={() => void warRoom.refresh()} disabled={warRoom.loading}>
            {warRoom.loading ? "SYNCING…" : "REFRESH"}
          </button>
        </div>
      </section>

      {warRoom.error ? <div className="war-room-error" role="status">{warRoom.error}</div> : null}

      <section className="surface-card war-room-shell">
        <div
          className="war-room-feed"
          ref={feedRef}
          aria-live="polite"
          onScroll={updateAtLatest}
        >
          {warRoom.hasMore ? (
            <button className="war-room-load-older" type="button" onClick={() => void loadOlder()} disabled={warRoom.loadingOlder}>
              {warRoom.loadingOlder ? "LOADING…" : "LOAD OLDER MESSAGES"}
            </button>
          ) : null}

          {warRoom.loading && !warRoom.messages.length ? (
            <div className="war-room-state"><strong>Loading the conversation…</strong></div>
          ) : !warRoom.messages.length ? (
            <div className="war-room-state">
              <strong>Open the room.</strong>
              <span>Start the first UFC debate.</span>
            </div>
          ) : warRoom.messages.map((message) => (
            <article className={`war-room-message${message.deleted ? " is-deleted" : ""}`} key={message.id}>
              <Link className="war-room-message__avatar" to={memberProfilePath(message.author.displayName)}>
                <MemberAvatar member={message.author} />
              </Link>
              <div className="war-room-message__content">
                <div className="war-room-message__meta">
                  <Link to={memberProfilePath(message.author.displayName)}>{message.author.displayName}</Link>
                  <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time>
                </div>

                {message.parent ? (
                  <Link className="war-room-parent" to={memberProfilePath(message.parent.author.displayName)}>
                    <strong>↳ {message.parent.author.displayName}</strong>
                    <span>{message.parent.deleted ? "Message deleted" : message.parent.body}</span>
                  </Link>
                ) : null}

                <p className="war-room-message__body">
                  {message.deleted || !message.body
                    ? <em>Message deleted</em>
                    : <MessageBody body={message.body} mentions={message.mentions} />}
                </p>

                {!message.deleted ? (
                  <div className="war-room-message__actions">
                    {!message.parent ? (
                      <button type="button" onClick={() => {
                        setReplyTo(message);
                        textareaRef.current?.focus();
                      }}>REPLY</button>
                    ) : null}
                    {message.canDelete ? (
                      <button
                        type="button"
                        disabled={warRoom.deletingMessageId === message.id}
                        onClick={() => {
                          if (window.confirm("Delete this War Room message?")) {
                            void warRoom.deleteMessage(message.id);
                          }
                        }}
                      >
                        {warRoom.deletingMessageId === message.id ? "DELETING…" : "DELETE"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
          <div ref={bottomRef} />
        </div>

        {warRoom.unreadCount > 0 && !atLatest ? (
          <button className="war-room-new-messages" type="button" onClick={() => jumpToLatest("smooth")}>
            {warRoom.unreadCount > 99 ? "99+" : warRoom.unreadCount} NEW
          </button>
        ) : null}

        <form className="war-room-composer" onSubmit={(event) => void submit(event)}>
          {replyTo ? (
            <div className="war-room-replying">
              <span><small>REPLYING TO</small><strong>{replyTo.author.displayName}</strong></span>
              <button type="button" onClick={() => setReplyTo(null)}>CANCEL</button>
            </div>
          ) : null}

          <div className="war-room-composer__field">
            <textarea
              ref={textareaRef}
              value={draft}
              maxLength={500}
              rows={3}
              placeholder="Say it in the War Room…"
              onChange={(event) => {
                setDraft(event.target.value);
                setCursor(event.target.selectionStart ?? event.target.value.length);
              }}
              onSelect={(event) => setCursor(event.currentTarget.selectionStart ?? draft.length)}
              aria-label="War Room message"
            />
            <span>{draft.length}/500</span>
          </div>

          {suggestions.length ? (
            <div className="war-room-mentions" aria-label="Mention a War Room member">
              {suggestions.map((member) => (
                <button type="button" key={member.id} onClick={() => insertMention(member)}>
                  <MemberAvatar member={member} />
                  <span>@{member.displayName}</span>
                </button>
              ))}
            </div>
          ) : null}

          <button className="primary-action war-room-send" type="submit" disabled={!draft.trim() || warRoom.posting}>
            {warRoom.posting ? "POSTING…" : "POST MESSAGE"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function WarRoomPage() {
  const identity = useIdentity();
  const warRoom = useWarRoom();

  if (identity.status === "loading" || warRoom.status === "idle" || warRoom.status === "checking") {
    return null;
  }

  if (!identity.profile || warRoom.status !== "eligible") {
    return <Navigate to="/" replace />;
  }

  return <WarRoomConversation />;
}
