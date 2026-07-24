import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const {
    enabled,
    profiles,
    activeProfile,
    challenges,
    setActiveProfile,
    markOpened,
    dismissChallenge,
    viewResults,
  } = usePlayChallenges();
  const [filter, setFilter] = useState<ChallengeCenterFilter>("all");
  const [expanded, setExpanded] = useState(false);

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

  if (!enabled || !activeProfile) return null;

  function openChallenge(challenge: PlayChallenge) {
    markOpened(challenge.code);
    navigate(challengePlayRoute(challenge));
  }

  function chooseFilter(value: ChallengeCenterFilter) {
    setFilter(value);
    setExpanded(false);
  }

  return (
    <section className="challenge-center surface-card" data-play-challenge-center>
      <header className="challenge-center__header">
        <div>
          <p className="eyebrow">CHALLENGE CENTER</p>
          <h2>Your matchups</h2>
        </div>
        <label className="challenge-center__preview-mode">
          <span>PREVIEW MODE</span>
          <select
            aria-label="PREVIEWING AS"
            value={activeProfile.id}
            onChange={(event) => {
              setActiveProfile(event.target.value);
              setExpanded(false);
            }}
          >
            {profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.displayName}</option>)}
          </select>
        </label>
      </header>

      <p className="challenge-center__hint">Results unlock after both profiles finish the exact same challenge.</p>

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
              const canPlay = direction === "received" && status !== "completed" && status !== "declined";
              const canView = status === "completed";
              const dismissLabel = direction === "received" && !canView ? "IGNORE" : "REMOVE";

              return (
                <article className={`challenge-center__row${statusClass(status)}`} key={challenge.code}>
                  <i className="challenge-center__avatar">{counterpart?.initials ?? "HQ"}</i>
                  <div className="challenge-center__row-copy">
                    <span>{copy.eyebrow}</span>
                    <strong>{counterpart?.displayName ?? "Octagon HQ profile"} · {challenge.gameTitle}</strong>
                    <small>{copy.detail}</small>
                  </div>
                  <div className="challenge-center__row-actions">
                    {canView ? (
                      <button type="button" className="results" onClick={() => viewResults(challenge.code)}>RESULTS</button>
                    ) : canPlay ? (
                      <button type="button" onClick={() => openChallenge(challenge)}>PLAY</button>
                    ) : (
                      <span className={`challenge-center__status is-${status}`}>{copy.action}</span>
                    )}
                    <button
                      type="button"
                      className="challenge-center__dismiss"
                      aria-label={`${dismissLabel} ${counterpart?.displayName ?? "challenge"} ${challenge.gameTitle}`}
                      onClick={() => dismissChallenge(challenge.code)}
                    >
                      {dismissLabel}
                    </button>
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
          No challenges here yet. Finish a game and send the exact setup to another profile.
        </div>
      )}
    </section>
  );
}
