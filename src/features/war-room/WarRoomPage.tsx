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
import { WarRoomAccessManager } from "./WarRoomAccessManager";
import type {
  WarRoomMember,
  WarRoomMessage,
  WarRoomReactionType,
} from "./warRoomModel";
import { useWarRoom } from "./WarRoomProvider";

const REACTION_OPTIONS = [
  { type: "like", icon: "👍", label: "Like" },
  { type: "dislike", icon: "👎", label: "Dislike" },
  { type: "exclaim", icon: "❗", label: "Exclaim" },
  { type: "laugh", icon: "😂", label: "Laugh" },
] satisfies readonly {
  type: WarRoomReactionType;
  icon: string;
  label: string;
}[];

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

function resizeComposer(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
}

function WarRoomConversation() {
  const identity = useIdentity();
  const warRoom = useWarRoom();
  const feedRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const reactionPressTimerRef = useRef<number | null>(null);
  const initialScrollRef = useRef(false);
  const previousLatestRef = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [cursor, setCursor] = useState(0);
  const [replyTo, setReplyTo] = useState<WarRoomMessage | null>(null);
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null);
  const [atLatest, setAtLatest] = useState(true);
  const [accessManagerOpen, setAccessManagerOpen] = useState(false);

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

  function openReactionPicker(messageId: string) {
    setReactionPickerMessageId((current) => current === messageId ? null : messageId);
  }

  function cancelReactionPress() {
    if (reactionPressTimerRef.current === null) return;
    window.clearTimeout(reactionPressTimerRef.current);
    reactionPressTimerRef.current = null;
  }

  function startReactionPress(messageId: string) {
    cancelReactionPress();
    reactionPressTimerRef.current = window.setTimeout(() => {
      setReactionPickerMessageId(messageId);
      reactionPressTimerRef.current = null;
    }, 420);
  }

  async function react(messageId: string, reactionType: WarRoomReactionType) {
    const saved = await warRoom.toggleReaction(messageId, reactionType);
    if (saved) setReactionPickerMessageId(null);
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

  useEffect(() => {
    if (replyTo && !warRoom.messages.some((message) => message.id === replyTo.id)) {
      setReplyTo(null);
    }
    if (
      reactionPickerMessageId
      && !warRoom.messages.some((message) => message.id === reactionPickerMessageId)
    ) {
      setReactionPickerMessageId(null);
    }
  }, [reactionPickerMessageId, replyTo, warRoom.messages]);

  useEffect(() => {
    if (!reactionPickerMessageId) return undefined;
    const closePicker = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-war-room-reaction-ui]")) return;
      setReactionPickerMessageId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReactionPickerMessageId(null);
    };
    document.addEventListener("pointerdown", closePicker);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closePicker);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [reactionPickerMessageId]);

  useEffect(() => () => cancelReactionPress(), []);

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
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
      if (textarea) resizeComposer(textarea);
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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
        <h1>War Room</h1>
        <div className="war-room-heading__actions">
          <span className={`war-room-live is-${warRoom.realtimeStatus}`}>
            <i aria-hidden="true" />
            {liveLabel(warRoom.realtimeStatus)}
          </span>
          {warRoom.role === "admin" ? (
            <button className="war-room-manage-access" type="button" onClick={() => setAccessManagerOpen(true)}>
              MANAGE ACCESS
            </button>
          ) : null}
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
          ) : warRoom.messages.map((message) => {
            const activeReactions = message.reactions.filter((reaction) => reaction.count > 0);
            const pickerOpen = reactionPickerMessageId === message.id;
            return (
              <article className="war-room-message" key={message.id}>
                <Link className="war-room-message__avatar" to={memberProfilePath(message.author.displayName)}>
                  <MemberAvatar member={message.author} />
                </Link>
                <div className="war-room-message__content">
                  <div className="war-room-message__meta">
                    <Link to={memberProfilePath(message.author.displayName)}>{message.author.displayName}</Link>
                    <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time>
                  </div>

                  <div
                    className={`war-room-message__bubble${activeReactions.length ? " has-tapbacks" : ""}`}
                    onPointerDown={() => startReactionPress(message.id)}
                    onPointerUp={cancelReactionPress}
                    onPointerCancel={cancelReactionPress}
                    onPointerLeave={cancelReactionPress}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      cancelReactionPress();
                      setReactionPickerMessageId(message.id);
                    }}
                  >
                    {message.parent ? (
                      <Link className="war-room-parent" to={memberProfilePath(message.parent.author.displayName)}>
                        <strong>↳ {message.parent.author.displayName}</strong>
                        <span>{message.parent.body}</span>
                      </Link>
                    ) : null}

                    {message.body ? (
                      <p className="war-room-message__body">
                        <MessageBody body={message.body} mentions={message.mentions} />
                      </p>
                    ) : null}

                    {activeReactions.length ? (
                      <button
                        className="war-room-tapback-summary"
                        data-war-room-reaction-ui
                        type="button"
                        aria-label="View or change reactions"
                        onClick={() => openReactionPicker(message.id)}
                      >
                        {activeReactions.map((reaction) => {
                          const option = REACTION_OPTIONS.find((item) => item.type === reaction.type);
                          if (!option) return null;
                          return (
                            <span className={reaction.reacted ? "is-mine" : ""} key={reaction.type}>
                              <i aria-hidden="true">{option.icon}</i>
                              {reaction.count > 1 ? <b>{reaction.count}</b> : null}
                            </span>
                          );
                        })}
                      </button>
                    ) : null}

                    {pickerOpen ? (
                      <div className="war-room-tapback-picker" data-war-room-reaction-ui role="toolbar" aria-label="React to this message">
                        {REACTION_OPTIONS.map((option) => {
                          const reaction = message.reactions.find((item) => item.type === option.type);
                          const selected = reaction?.reacted ?? false;
                          const reactionKey = `${message.id}:${option.type}`;
                          return (
                            <button
                              type="button"
                              key={option.type}
                              className={selected ? "is-selected" : ""}
                              aria-pressed={selected}
                              aria-label={option.label}
                              disabled={Boolean(warRoom.reactingKey)}
                              onClick={() => void react(message.id, option.type)}
                            >
                              <span aria-hidden="true">{option.icon}</span>
                              {warRoom.reactingKey === reactionKey ? <i aria-hidden="true" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div className="war-room-message__actions">
                    <button type="button" data-war-room-reaction-ui onClick={() => openReactionPicker(message.id)}>
                      REACT
                    </button>
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
                </div>
              </article>
            );
          })}
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

          <div className="war-room-composer__row">
            <div className="war-room-composer__field">
              <textarea
                ref={textareaRef}
                value={draft}
                maxLength={500}
                rows={1}
                placeholder="Say it in the War Room…"
                onChange={(event) => {
                  setDraft(event.target.value);
                  setCursor(event.target.selectionStart ?? event.target.value.length);
                  resizeComposer(event.target);
                }}
                onSelect={(event) => setCursor(event.currentTarget.selectionStart ?? draft.length)}
                aria-label="War Room message"
              />
              <span>{draft.length}/500</span>
            </div>
            <button className="primary-action war-room-send" type="submit" disabled={!draft.trim() || warRoom.posting}>
              {warRoom.posting ? "POSTING…" : "POST"}
            </button>
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
        </form>
      </section>

      <WarRoomAccessManager open={accessManagerOpen} onClose={() => {
        setAccessManagerOpen(false);
        warRoom.clearAccessRoster();
      }} />
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
