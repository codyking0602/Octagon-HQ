import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  challengeDirection,
  challengeStatus,
  type ChallengeStatus,
  type PlayChallenge,
} from "./challengeModel";
import { challengeCounterpart, usePlayChallenges } from "./ChallengeProvider";

export type ChallengeCenterFilter = "all" | "received" | "sent";

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
    if (status === "opened") return { eyebrow: "OPENED BY", detail: "They opened it · waiting on their result", action: "WAITING" };
    return { eyebrow: "SENT TO", detail: `Waiting for them to open · ${timeAgo(challenge.createdAt)}`, action: "WAITING" };
  }

  if (status === "completed") return { eyebrow: "COMPLETED WITH", detail: `Both finished ${timeAgo(challenge.completedAt ?? challenge.createdAt)}`, action: "RESULTS" };
  if (status === "opened") return { eyebrow: "FROM", detail: "Opened · your result is still waiting", action: "PLAY" };
  return { eyebrow: "NEW FROM", detail: `Sent ${timeAgo(challenge.createdAt)}`, action: "PLAY" };
}

function challengeRoute(challenge: PlayChallenge) {
  if (challenge.gameId === "find-leader") {
    const setup = challenge.setup;
    const day = setup && !Array.isArray(setup) && typeof setup === "object" && typeof setup.day === "string"
      ? setup.day
      : "";
    const params = new URLSearchParams({ challenge: challenge.code });
    if (day) params.set("day", day);
    return `/play/find-leader?${params.toString()}`;
  }
  return "/play";
}

function statusClass(status: ChallengeStatus) {
  if (status === "completed") return " is-completed";
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
    viewResults,
  } = usePlayChallenges();
  const [filter, setFilter] = useState<ChallengeCenterFilter>("all");

  const counts = useMemo(() => ({
    all: challenges.length,
    received: challenges.filter((row) => challengeDirection(row, activeProfile?.id ?? "") === "received").length,
    sent: challenges.filter((row) => challengeDirection(row, activeProfile?.id ?? "") === "sent").length,
  }), [activeProfile?.id, challenges]);

  const rows = challenges.filter((row) => {
    if (!activeProfile || filter === "all") return true;
    return challengeDirection(row, activeProfile.id) === filter;
  });

  if (!enabled || !activeProfile) return null;

  function openChallenge(challenge: PlayChallenge) {
    markOpened(challenge.code);
    navigate(challengeRoute(challenge));
  }

  return (
    <section className="challenge-center surface-card" data-play-challenge-center>
      <header className="challenge-center__header">
        <div>
          <p className="eyebrow">CHALLENGE CENTER</p>
          <h2>Your matchups</h2>
          <p>Results unlock only after both profiles finish the exact same challenge.</p>
        </div>
        <label>
          <span>PREVIEWING AS</span>
          <select
            aria-label="PREVIEWING AS"
            value={activeProfile.id}
            onChange={(event) => setActiveProfile(event.target.value)}
          >
            {profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.displayName}</option>)}
          </select>
        </label>
      </header>

      <div className="challenge-center__lab-note">
        Preview identity lab · switch profiles to test Sent, Received, and shared results before real profiles connect.
      </div>

      <div className="challenge-center__filters" role="tablist" aria-label="Challenge filters">
        {(["all", "received", "sent"] as const).map((value) => (
          <button
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={filter === value ? "is-active" : ""}
            key={value}
            onClick={() => setFilter(value)}
          >
            {value.toUpperCase()} {counts[value]}
          </button>
        ))}
      </div>

      {rows.length ? (
        <div className="challenge-center__list">
          {rows.map((challenge) => {
            const direction = challengeDirection(challenge, activeProfile.id);
            const status = challengeStatus(challenge, activeProfile.id);
            const counterpart = challengeCounterpart(challenge, activeProfile.id, profiles);
            const copy = rowCopy(challenge, activeProfile.id);
            const canPlay = direction === "received" && status !== "completed";
            const canView = status === "completed";

            return (
              <article className={`challenge-center__row${statusClass(status)}`} key={challenge.code}>
                <i className="challenge-center__avatar">{counterpart?.initials ?? "HQ"}</i>
                <div>
                  <span>{copy.eyebrow}</span>
                  <strong>{counterpart?.displayName ?? "Octagon HQ profile"} · {challenge.gameTitle}</strong>
                  <small>{copy.detail}</small>
                </div>
                {canView ? (
                  <button type="button" className="results" onClick={() => viewResults(challenge.code)}>RESULTS</button>
                ) : canPlay ? (
                  <button type="button" onClick={() => openChallenge(challenge)}>PLAY</button>
                ) : (
                  <button type="button" disabled>{copy.action}</button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="challenge-center__empty">
          No challenges here yet. Finish Find the Leader and send the exact board to the other preview profile.
        </div>
      )}
    </section>
  );
}
