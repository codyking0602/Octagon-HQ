import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { memberProfilePath } from "../members/memberProfilesModel";
import {
  challengeDirection,
  challengeStatus,
  type ChallengeStatus,
  type PlayChallenge,
} from "./challengeModel";
import { challengeCounterpart, usePlayChallenges } from "./ChallengeProvider";
import { challengePlayRoute } from "./challengeRuntime";

export type ChallengeCenterFilter = "all" | "received" | "sent";

const COLLAPSED_ROW_LIMIT = 3;

function timeAgo(value: string) {
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7
    ? `${days}d ago`
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function rowCopy(challenge: PlayChallenge, profileId: string) {
  const direction = challengeDirection(challenge, profileId);
  const status = challengeStatus(challenge, profileId);

  if (challenge.gameId === "auction") {
    if (status === "completed") return { eyebrow: "AUCTION COMPLETE WITH", detail: "Open the final server state", action: "OPEN" };
    if (status === "declined") return { eyebrow: "AUCTION DECLINED BY", detail: "This Auction has ended", action: "DECLINED" };
    if (direction === "sent") return { eyebrow: "AUCTION WITH", detail: status === "opened" ? "Open Auction · check whose bid is required" : "Waiting for their first bid", action: "OPEN" };
    return { eyebrow: "AUCTION FROM", detail: status === "opened" ? "Open Auction · check whose bid is required" : "Your first sealed bid accepts", action: "BID" };
  }

  if (direction === "sent") {
    if (status === "completed") return { eyebrow: "COMPLETED WITH", detail: `Both finished ${timeAgo(challenge.completedAt ?? challenge.createdAt)}`, action: "RESULTS" };
    if (status === "declined") return { eyebrow: "DECLINED BY", detail: "They passed on this challenge", action: "DECLINED" };
    if (status === "opened") return { eyebrow: "OPENED BY", detail: "They opened it · waiting on their result", action: "OPENED" };
    return { eyebrow: "SENT TO", detail: `Waiting for them to open · ${timeAgo(challenge.createdAt)}`, action: "WAITING" };
  }

  if (status === "completed") return { eyebrow: "COMPLETED WITH", detail: `Both finished ${timeAgo(challenge.completedAt ?? challenge.createdAt)}`, action: "RESULTS" };
  if (status === "opened") return { eyebrow: "FROM", detail: "Opened · your result is still waiting", action: "PLAY" };
  return { eyebrow: "NEW FROM", detail: `Sent ${timeAgo(challenge.createdAt)}`, action: "PLAY" };
}

function statusClass(status: ChallengeStatus) {
  if (status === "completed") return " is-completed";
  if (status === "declined") return " is-declined";
  if (status === "new") return " is-new";
  return "";
}

export function ChallengeCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identity = useIdentity();
  const {
    configured,
    enabled,
    loading,
    error,
    profiles,
    activeProfile,
    challenges,
    refresh,
    markOpened,
    dismissChallenge,
    viewResults,
  } = usePlayChallenges();
  const [filter, setFilter] = useState<ChallengeCenterFilter>("all");
  const [expanded, setExpanded] = useState(false);
  const centerRef = useRef<HTMLElement | null>(null);
  const handledDestinationRef = useRef("");
  const requestedCode = searchParams.get("challenge")?.trim().toUpperCase() ?? "";

  const counts = useMemo(() => ({
    all: challenges.length,
    received: challenges.filter((row) => challengeDirection(row, activeProfile?.id ?? "") === "received").length,
    sent: challenges.filter((row) => challengeDirection(row, activeProfile?.id ?? "") === "sent").length,
  }), [activeProfile?.id, challenges]);

  const rows = challenges.filter((row) => {
    if (!activeProfile || filter === "all") return true;
    return challengeDirection(row, activeProfile.id) === filter;
  });
  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_ROW_LIMIT);

  useEffect(() => {
    if (!requestedCode || !activeProfile || loading) return;
    const requested = challenges.find((challenge) => challenge.code === requestedCode);
    if (!requested) return;

    const requestKey = `${activeProfile.id}:${requested.code}`;
    if (handledDestinationRef.current === requestKey) return;
    handledDestinationRef.current = requestKey;

    const direction = challengeDirection(requested, activeProfile.id);
    if (!direction) return;
    const status = challengeStatus(requested, activeProfile.id);

    if (status === "completed") {
      viewResults(requested.code);
      return;
    }

    if (direction === "received" && status !== "declined") {
      void markOpened(requested.code);
      navigate(challengePlayRoute(requested), { replace: true });
      return;
    }

    setFilter(direction);
    setExpanded(true);
    centerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    centerRef.current?.focus({ preventScroll: true });
  }, [activeProfile, challenges, loading, markOpened, navigate, requestedCode, viewResults]);

  if (!configured) return null;

  if (!enabled || !activeProfile) {
    return (
      <section
        ref={centerRef}
        id="challenge-center"
        className="challenge-center surface-card"
        data-play-challenge-center
        tabIndex={requestedCode ? -1 : undefined}
      >
        <header className="challenge-center__header">
          <div><p className="eyebrow">CHALLENGE CENTER</p><h2>Play against friends</h2></div>
        </header>
        <p className="challenge-center__hint">Sign in to send and receive the same locked UFC games across devices.</p>
        <button className="primary-action challenge-center__sign-in" type="button" onClick={identity.openDialog}>SIGN IN TO CHALLENGE</button>
      </section>
    );
  }

  function openChallenge(challenge: PlayChallenge) {
    void markOpened(challenge.code);
    navigate(challengePlayRoute(challenge));
  }

  function chooseFilter(value: ChallengeCenterFilter) {
    setFilter(value);
    setExpanded(false);
  }

  return (
    <section
      ref={centerRef}
      id="challenge-center"
      className="challenge-center surface-card"
      data-play-challenge-center
      tabIndex={requestedCode ? -1 : undefined}
    >
      <header className="challenge-center__header">
        <div>
          <p className="eyebrow">CHALLENGE CENTER</p>
          <h2>{activeProfile.displayName}'s matchups</h2>
        </div>
        <button className="challenge-center__refresh" type="button" disabled={loading} onClick={() => void refresh()}>
          {loading ? "SYNCING…" : "REFRESH"}
        </button>
      </header>

      <p className="challenge-center__hint">Results unlock only after both profiles finish the exact same challenge.</p>
      {error ? <p className="challenge-center__error" role="status">{error}</p> : null}

      <div className="challenge-center__filters" role="tablist" aria-label="Challenge filters">
        {(["all", "received", "sent"] as const).map((value) => (
          <button
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={filter === value ? "is-active" : ""}
            key={value}
            onClick={() => chooseFilter(value)}
          >
            {value.toUpperCase()} {counts[value]}
          </button>
        ))}
      </div>

      {rows.length ? (
        <>
          <div className="challenge-center__list">
            {visibleRows.map((challenge) => {
              const direction = challengeDirection(challenge, activeProfile.id);
              const status = challengeStatus(challenge, activeProfile.id);
              const counterpart = challengeCounterpart(challenge, activeProfile.id, profiles);
              const copy = rowCopy(challenge, activeProfile.id);
              const auction = challenge.gameId === "auction";
              const canPlay = auction ? status !== "declined" : direction === "received" && status !== "completed" && status !== "declined";
              const canView = !auction && status === "completed";
              const dismissLabel = direction === "received" && !canView ? "IGNORE" : "REMOVE";
              const memberContent = (
                <>
                  <i className="challenge-center__avatar">{counterpart?.initials ?? "HQ"}</i>
                  <div className="challenge-center__row-copy">
                    <span>{copy.eyebrow}</span>
                    <strong>{counterpart?.displayName ?? "Octagon HQ profile"} · {challenge.gameTitle}</strong>
                    <small>{copy.detail}</small>
                  </div>
                </>
              );

              return (
                <article className={`challenge-center__row${statusClass(status)}`} key={challenge.code}>
                  {counterpart ? (
                    <Link
                      className="challenge-center__member-link"
                      to={memberProfilePath(counterpart.displayName)}
                      aria-label={`View ${counterpart.displayName} member profile`}
                    >
                      {memberContent}
                    </Link>
                  ) : (
                    <div className="challenge-center__member-link">{memberContent}</div>
                  )}
                  <div className="challenge-center__row-actions">
                    {canView ? (
                      <button type="button" className="results" onClick={() => viewResults(challenge.code)}>RESULTS</button>
                    ) : canPlay ? (
                      <button type="button" onClick={() => openChallenge(challenge)}>PLAY</button>
                    ) : (
                      <span className={`challenge-center__status is-${status}`}>{copy.action}</span>
                    )}
                    {!auction ? <button
                      type="button"
                      className="challenge-center__dismiss"
                      aria-label={`${dismissLabel} ${counterpart?.displayName ?? "challenge"} ${challenge.gameTitle}`}
                      onClick={() => void dismissChallenge(challenge.code)}
                    >
                      {dismissLabel}
                    </button> : null}
                  </div>
                </article>
              );
            })}
          </div>
          {rows.length > COLLAPSED_ROW_LIMIT ? (
            <button className="challenge-center__view-all" type="button" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "SHOW RECENT CHALLENGES" : `VIEW ALL ${rows.length} CHALLENGES`} →
            </button>
          ) : null}
        </>
      ) : (
        <div className="challenge-center__empty">
          {loading ? "Syncing profile challenges…" : "No challenges yet. Finish a game and send the exact setup to another profile."}
        </div>
      )}
    </section>
  );
}
