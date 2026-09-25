import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  formatChampionshipPoints,
  type MlbChampionship,
} from "./mlbChampionship";
import {
  MLB_OWNER_PREVIEW_CHAMPIONSHIP,
  MLB_OWNER_PREVIEW_HUB,
  MLB_OWNER_PREVIEW_PLAY_LEADERBOARD,
} from "./mlbOwnerPreview";
import {
  loadMlbPlayChallengeOverview,
  loadMlbPlayPreviewResult,
  type MlbPlayChallengeLeaderboardEntry,
  type MlbPlayChallengeOverview,
} from "./mlbPlayChallenge";
import { useMlbChampionship } from "./useMlbChampionship";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/play-landing-shared.css";
import "../../styles/today-challenge-hub.css";
import "../../styles/daily-leaderboard-result-page.css";
import "../../styles/mlb-playoffs.css";

function challengeDateLabel(day: string | null | undefined) {
  if (!day) return "POSTSEASON";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`)).toUpperCase();
}

function previewOverview(
  challengeKey: string,
  displayName: string,
  initials: string,
): MlbPlayChallengeOverview {
  const own = loadMlbPlayPreviewResult(challengeKey);
  if (!own) {
    return {
      unlocked: false,
      playerCount: 0,
      ownResult: null,
      entries: [],
    };
  }

  const current: MlbPlayChallengeLeaderboardEntry = {
    rank: 1,
    profileId: "preview-current-user",
    displayName,
    initials,
    avatarPhotoData: null,
    ...own,
    isCurrentUser: true,
  };

  const sorted = [
    current,
    ...MLB_OWNER_PREVIEW_PLAY_LEADERBOARD.filter((entry) => !entry.isCurrentUser),
  ].sort((left, right) => (
    right.rawScore - left.rawScore
    || Date.parse(left.completedAt) - Date.parse(right.completedAt)
    || left.displayName.localeCompare(right.displayName)
  ));

  let previousScore: number | null = null;
  let previousRank = 0;
  const ranked = sorted.map((entry, index) => {
    const rank = previousScore === entry.rawScore ? previousRank : index + 1;
    previousScore = entry.rawScore;
    previousRank = rank;
    return { ...entry, rank };
  });

  return {
    unlocked: true,
    playerCount: ranked.length,
    ownResult: own,
    entries: ranked,
  };
}

function gameRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const games = Array.isArray(detail.games) ? detail.games : [];
  return games.map((value, index) => {
    const game = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const score = Number(game.score ?? 0);
    const perfect = game.perfect === true;
    const inferredSafe = perfect ? 9 : Math.max(0, Math.round(score / 10) - 1);
    return {
      game: Number(game.game ?? index + 1),
      score,
      perfect,
      safeCount: Number(game.safe_count ?? inferredSafe),
      fatalName: typeof game.fatal_name === "string" ? game.fatal_name : null,
    };
  });
}

function wavelengthRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const rounds = Array.isArray(entry.resultDetail.rounds) ? entry.resultDetail.rounds : [];
  return rounds.map((value, index) => {
    const round = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const guesses = Array.isArray(round.guesses)
      ? round.guesses.filter((guess): guess is number => typeof guess === "number")
      : [];
    return {
      round: Number(round.round ?? index + 1),
      score: Number(round.score ?? 0),
      target: Number(round.target ?? 0),
      finalGuess: Number(round.final_guess ?? guesses.at(-1) ?? 0),
      guesses,
    };
  });
}

function MlbPlayResultDetail({
  entry,
  challengeTitle,
  onClose,
}: {
  entry: MlbPlayChallengeLeaderboardEntry;
  challengeTitle: string;
  onClose: () => void;
}) {
  const games = gameRows(entry);
  const wavelengthRounds = wavelengthRows(entry);
  const isWavelength = entry.gameType === "wavelength";

  return (
    <div
      className="today-hub-official-result mlb-play-result-detail"
      role="dialog"
      aria-label={`${entry.displayName} MLB Play result`}
    >
      <header className="today-hub-official-result__header">
        <button type="button" onClick={onClose}>← LEADERBOARD</button>
        <span className="today-hub-official-result__identity">
          <span className="today-hub-official-result__avatar" aria-hidden="true">
            {entry.avatarPhotoData ? <img src={entry.avatarPhotoData} alt="" /> : <b>{entry.initials}</b>}
          </span>
          <span className="today-hub-official-result__identity-copy">
            <strong>{entry.displayName}</strong>
            <small>#{entry.rank} · {entry.rawScore}/100</small>
          </span>
        </span>
      </header>

      <div className="today-hub-official-result__body">
        <section className="mlb-play-result-card">
          <div>
            <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
            <h2>{challengeTitle}</h2>
            <span>FINAL SCORE</span>
            <strong>{entry.rawScore}<small>/100</small></strong>
          </div>

          {isWavelength && wavelengthRounds.length ? (
            <div className="mlb-play-result-card__games">
              {wavelengthRounds.map((round) => (
                <article key={round.round}>
                  <span>GAME {round.round}</span>
                  <strong>{round.score}<small>/100</small></strong>
                  <small>HIDDEN {round.target} · FINAL {round.finalGuess}</small>
                  {round.guesses.length ? <small>PATH {round.guesses.join(" → ")}</small> : null}
                </article>
              ))}
            </div>
          ) : games.length ? (
            <div className="mlb-play-result-card__games">
              {games.map((game) => (
                <article key={game.game}>
                  <span>GAME {game.game}</span>
                  <strong>{game.score}<small>/100</small></strong>
                  <small>
                    {game.perfect
                      ? "9 SAFE · PERFECT BOARD"
                      : `${game.safeCount} SAFE · LEADER PICKED${game.fatalName ? ` · ${game.fatalName}` : ""}`}
                  </small>
                </article>
              ))}
            </div>
          ) : null}

          <p>
            {isWavelength
              ? "The challenge score is the average of both Wavelength games."
              : "The challenge score is the average of both Find the Leader boards."}
          </p>
        </section>
      </div>
    </div>
  );
}

function MlbPlayStandings({ championship }: { championship: MlbChampionship | null }) {
  const standings = useMemo(() => {
    if (!championship) return [];
    return [...championship.standings].sort((left, right) => (
      left.play_rank - right.play_rank
      || right.play_points - left.play_points
      || left.display_name.localeCompare(right.display_name)
    ));
  }, [championship]);

  const rankCounts = useMemo(() => {
    const counts = new Map<number, number>();
    standings.forEach((entry) => counts.set(entry.play_rank, (counts.get(entry.play_rank) ?? 0) + 1));
    return counts;
  }, [standings]);

  return (
    <section className="mlb-play-standings" aria-label="MLB Play standings">
      <header>
        <div>
          <p className="eyebrow">PLAY STANDINGS</p>
          <h2>Postseason challenge race</h2>
        </div>
        <span>25 PTS</span>
      </header>

      {standings.length ? (
        <div className="mlb-play-standings__rows">
          {standings.map((entry) => (
            <div
              className={`mlb-play-standings__row${entry.is_current_user ? " is-current" : ""}`}
              key={entry.profile_id}
            >
              <b>{rankCounts.get(entry.play_rank)! > 1 ? `T-${entry.play_rank}` : `#${entry.play_rank}`}</b>
              <strong>{entry.display_name}</strong>
              <span>
                <b>{formatChampionshipPoints(entry.play_points)}</b>
                <small>/ {championship?.playMax ?? 25}</small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="today-hub-empty">Play standings will populate when the postseason challenges begin.</p>
      )}

      <footer>10 CHALLENGES · PLACEMENT POINTS FEED THE MLB CHAMPIONSHIP</footer>
    </section>
  );
}

export default function MlbPlayoffsPage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading } = useMlbPlayoffs(signedIn);
  const { championship: liveChampionship } = useMlbChampionship(signedIn);
  const previewMode = identity.profile?.canControlPicks === true && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const championship = previewMode ? MLB_OWNER_PREVIEW_CHAMPIONSHIP : liveChampionship;
  const challenge = hub?.featuredChallenge ?? null;

  const carouselRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<"challenge" | "leaderboard">("challenge");
  const [overview, setOverview] = useState<MlbPlayChallengeOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!challenge || !identity.profile) {
      setOverview(null);
      return;
    }

    if (previewMode) {
      setOverview(previewOverview(challenge.id, identity.profile.displayName, identity.profile.initials));
      return;
    }

    let active = true;
    setOverviewLoading(true);
    void loadMlbPlayChallengeOverview(hub?.season ?? 2026, challenge.id)
      .then((next) => {
        if (active) setOverview(next);
      })
      .catch(() => {
        if (active) setOverview(null);
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [challenge, hub?.season, identity.profile, previewMode]);

  const selectedEntry = overview?.entries.find((entry) => entry.profileId === selectedProfileId) ?? null;
  const completed = Boolean(overview?.ownResult);

  const showPanel = (nextPanel: "challenge" | "leaderboard") => {
    const carousel = carouselRef.current;
    const targetLeft = carousel ? carousel.clientWidth * (nextPanel === "leaderboard" ? 1 : 0) : 0;
    if (carousel && typeof carousel.scrollTo === "function") {
      carousel.scrollTo({ left: targetLeft, behavior: "smooth" });
    } else if (carousel) {
      carousel.scrollLeft = targetLeft;
    }
    setPanel(nextPanel);
  };

  const updatePanelFromScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel?.clientWidth) return;
    const nextPanel = carousel.scrollLeft >= carousel.clientWidth / 2 ? "leaderboard" : "challenge";
    setPanel((current) => current === nextPanel ? current : nextPanel);
  };

  if (selectedEntry && challenge) {
    return (
      <MlbPlayResultDetail
        entry={selectedEntry}
        challengeTitle={challenge.title}
        onClose={() => setSelectedProfileId(null)}
      />
    );
  }

  return (
    <div className="page mlb-play-page">
      <section className="play-landing-heading mlb-play-page__heading">
        <h1>Play</h1>
        <p>Postseason challenges.</p>
      </section>

      {challenge ? (
        <section className="today-hub mlb-play-hub" data-sport="mlb">
          <div
            className="today-hub__carousel"
            ref={carouselRef}
            onScroll={updatePanelFromScroll}
            aria-label="MLB Playoff Challenge and leaderboard"
          >
            <button
              className="today-hub-card"
              type="button"
              onClick={() => navigate(challenge.route)}
            >
              <div className="today-hub-card__topline">
                <span>MLB PLAYOFF CHALLENGE</span>
                <b>{challengeDateLabel(challenge.date)}</b>
              </div>
              <div className="today-hub-card__body">
                <small>{completed && overview?.ownResult
                  ? `OFFICIAL RESULT · ${overview.ownResult.rawScore}`
                  : "OFFICIAL PLAYOFF CHALLENGE"}</small>
                <h2>{challenge.title}</h2>
                <p>{challenge.description}</p>
              </div>
              <em>{completed ? "VIEW CHALLENGE" : "PLAY CHALLENGE"} →</em>
              <span className="today-hub-card__swipe">SWIPE FOR CHALLENGE LEADERBOARD →</span>
            </button>

            <div className="today-hub-leaderboard">
              <header>
                <div>
                  <p className="eyebrow">CHALLENGE LEADERBOARD</p>
                  <h2>{challenge.title}</h2>
                </div>
                <span>{overview?.unlocked ? `${overview.playerCount} PLAYERS` : "LOCKED"}</span>
              </header>

              {overviewLoading && !overview ? (
                <p className="today-hub-empty">Loading challenge leaderboard…</p>
              ) : !overview?.unlocked ? (
                <p className="today-hub-empty">Finish this challenge to unlock the leaderboard and everyone’s completed result.</p>
              ) : overview.entries.length ? (
                <div className="today-hub-leaderboard__rows">
                  {overview.entries.map((entry) => (
                    <button
                      className={`today-hub-leaderboard__row${entry.isCurrentUser ? " is-current" : ""}`}
                      key={entry.profileId}
                      type="button"
                      aria-label={`View ${entry.displayName}'s challenge result`}
                      onClick={() => setSelectedProfileId(entry.profileId)}
                    >
                      <b>#{entry.rank}</b>
                      <strong>{entry.displayName}</strong>
                      <small>{entry.rawScore}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="today-hub-empty">No completed results yet.</p>
              )}
              <small className="today-hub-leaderboard__swipe">← SWIPE FOR CHALLENGE</small>
            </div>
          </div>

          <div className="today-hub__pager" aria-label="MLB Play challenge carousel controls">
            <button
              className={panel === "challenge" ? "is-active" : ""}
              type="button"
              aria-label="Show challenge"
              aria-pressed={panel === "challenge"}
              onClick={() => showPanel("challenge")}
            >
              <span>GAME</span>
            </button>
            <button
              className={panel === "leaderboard" ? "is-active" : ""}
              type="button"
              aria-label="Show challenge leaderboard"
              aria-pressed={panel === "leaderboard"}
              onClick={() => showPanel("leaderboard")}
            >
              <span>LEADERBOARD</span>
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="today-hub-loading mlb-play-loading">
          <span />
          <strong>Loading MLB Play…</strong>
        </section>
      ) : (
        <section className="today-hub-gate mlb-play-loading">
          <div>
            <p className="eyebrow">MLB PLAYOFFS</p>
            <h2>Next challenge coming soon.</h2>
          </div>
        </section>
      )}

      <MlbPlayStandings championship={championship} />
    </div>
  );
}
