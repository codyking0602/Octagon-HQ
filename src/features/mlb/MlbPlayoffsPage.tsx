import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  MLB_PLAY_CURRENT_CHALLENGE_DATE,
  MLB_PLAY_CURRENT_CHALLENGE_KEY,
  type MlbPlayChallengeLeaderboardEntry,
} from "./mlbPlayChallenge";
import {
  MLB_OWNER_PREVIEW_CHAMPIONSHIP,
  MLB_OWNER_PREVIEW_HUB,
  MLB_OWNER_PREVIEW_PLAY_LEADERBOARD,
} from "./mlbOwnerPreview";
import { formatChampionshipPoints } from "./mlbChampionship";
import { useMlbChampionship } from "./useMlbChampionship";
import { useMlbPlayChallengeOverview } from "./useMlbPlayChallengeOverview";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/play-landing-shared.css";
import "../../styles/today-challenge-hub.css";
import "../../styles/mlb-playoffs.css";

function dateLabel(value: string) {
  if (!Number.isFinite(Date.parse(`${value}T12:00:00Z`))) return "PLAYOFFS";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00Z`)).toUpperCase();
}

function resultGames(entry: MlbPlayChallengeLeaderboardEntry) {
  const games = entry.resultDetail.games;
  if (!Array.isArray(games)) {
    const publicScores = entry.publicResult.game_scores;
    return Array.isArray(publicScores)
      ? publicScores.map((score, index) => ({
          number: index + 1,
          score: typeof score === "number" ? score : null,
          perfect: score === 100,
          safe: typeof score === "number" ? (score === 100 ? 9 : Math.max(0, Math.round(score / 10) - 1)) : null,
          fatalName: null as string | null,
        }))
      : [];
  }

  return games.map((value, index) => {
    const row = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const score = typeof row.score === "number" ? row.score : null;
    return {
      number: index + 1,
      score,
      perfect: row.perfect === true,
      safe: typeof row.safe_count === "number"
        ? row.safe_count
        : score === null ? null : score === 100 ? 9 : Math.max(0, Math.round(score / 10) - 1),
      fatalName: typeof row.fatal_name === "string" ? row.fatal_name : null,
    };
  });
}

function rerank(entries: MlbPlayChallengeLeaderboardEntry[]) {
  const sorted = [...entries].sort((left, right) => (
    right.rawScore - left.rawScore
    || left.completedAt.localeCompare(right.completedAt)
    || left.displayName.localeCompare(right.displayName)
  ));
  let priorScore: number | null = null;
  let priorRank = 0;
  return sorted.map((entry, index) => {
    const rank = priorScore === entry.rawScore ? priorRank : index + 1;
    priorScore = entry.rawScore;
    priorRank = rank;
    return { ...entry, rank };
  });
}

function buildOwnerLeaderboard(
  profile: { id: string; displayName: string; initials: string },
  own: NonNullable<ReturnType<typeof useMlbPlayChallengeOverview>["overview"]>["ownResult"],
) {
  if (!own) return [];
  const others = MLB_OWNER_PREVIEW_PLAY_LEADERBOARD.filter((entry) => !entry.isCurrentUser);
  return rerank([
    ...others,
    {
      rank: 1,
      profileId: profile.id,
      displayName: profile.displayName,
      initials: profile.initials,
      avatarPhotoData: null,
      rawScore: own.rawScore,
      gameType: own.gameType,
      publicResult: own.publicResult,
      resultDetail: own.resultDetail,
      completedAt: own.completedAt,
      isCurrentUser: true,
    },
  ]);
}

function ChallengeResultDetail({
  entry,
  onClose,
}: {
  entry: MlbPlayChallengeLeaderboardEntry;
  onClose: () => void;
}) {
  const games = resultGames(entry);
  return (
    <div className="mlb-play-result-detail">
      <header>
        <button type="button" onClick={onClose}>← LEADERBOARD</button>
        <span>
          <b>{entry.displayName}</b>
          <small>#{entry.rank} · {entry.rawScore}/100</small>
        </span>
      </header>
      <div className="mlb-play-result-detail__score">
        <span>FINAL SCORE</span>
        <strong>{entry.rawScore}<small>/100</small></strong>
      </div>
      {games.length ? (
        <div className="mlb-play-result-detail__games">
          {games.map((game) => (
            <span key={game.number}>
              <small>GAME {game.number}</small>
              <strong>{game.score ?? "—"}</strong>
              <em>
                {game.perfect
                  ? "PERFECT"
                  : game.safe !== null
                    ? `${game.safe} SAFE${game.fatalName ? ` · STOPPED ON ${game.fatalName.toUpperCase()}` : ""}`
                    : "COMPLETE"}
              </em>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MlbPlayoffsPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<"challenge" | "leaderboard">("challenge");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const owner = identity.profile?.canControlPicks === true;
  const { hub: liveHub, loading: hubLoading } = useMlbPlayoffs(signedIn);
  const { championship: liveChampionship, loading: championshipLoading } = useMlbChampionship(signedIn);
  const {
    overview,
    loading: overviewLoading,
  } = useMlbPlayChallengeOverview({
    enabled: signedIn,
    season: 2026,
    challengeKey: MLB_PLAY_CURRENT_CHALLENGE_KEY,
  });

  const previewActive = owner && (!liveHub || !liveHub.fieldReady);
  const hub = previewActive ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const championship = previewActive ? MLB_OWNER_PREVIEW_CHAMPIONSHIP : liveChampionship;
  const challenge = hub?.featuredChallenge;
  const completed = Boolean(overview?.ownResult);
  const challengeDate = challenge?.date ?? MLB_PLAY_CURRENT_CHALLENGE_DATE;
  const challengeRoute = challenge?.route ?? "/mlb/challenge";
  const challengeTitle = challenge?.title ?? "Find the Leader";
  const challengeDescription = challenge?.description ?? "Two boards. One final score.";

  const leaderboardEntries = useMemo(() => {
    if (!overview?.unlocked || !identity.profile) return [];
    if (previewActive && overview.entries.length <= 1) {
      return buildOwnerLeaderboard(identity.profile, overview.ownResult);
    }
    return overview.entries;
  }, [identity.profile, overview, previewActive]);

  const selectedEntry = leaderboardEntries.find((entry) => entry.profileId === selectedProfileId) ?? null;
  const playStandings = useMemo(
    () => [...(championship?.standings ?? [])].sort((left, right) => (
      left.play_rank - right.play_rank || right.play_points - left.play_points || left.display_name.localeCompare(right.display_name)
    )),
    [championship],
  );

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

  return (
    <div className="page mlb-play-page">
      <section className="play-landing-heading mlb-play-page__heading">
        <h1>Play</h1>
        <p>Postseason challenges.</p>
      </section>

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
            onClick={() => navigate(challengeRoute)}
          >
            <div className="today-hub-card__topline">
              <span>MLB PLAYOFF CHALLENGE</span>
              <b>{dateLabel(challengeDate)}</b>
            </div>
            <div className="today-hub-card__body">
              <small>
                {completed && overview?.ownResult
                  ? `OFFICIAL RESULT · ${overview.ownResult.rawScore}`
                  : "OFFICIAL PLAYOFF CHALLENGE"}
              </small>
              <h2>{challengeTitle}</h2>
              <p>{challengeDescription}</p>
            </div>
            <em>{completed ? "VIEW OFFICIAL RESULT" : "PLAY CHALLENGE"} →</em>
            <span className="today-hub-card__swipe">SWIPE FOR CHALLENGE LEADERBOARD →</span>
          </button>

          <div className="today-hub-leaderboard">
            {selectedEntry ? (
              <ChallengeResultDetail entry={selectedEntry} onClose={() => setSelectedProfileId(null)} />
            ) : (
              <>
                <header>
                  <div>
                    <p className="eyebrow">CHALLENGE LEADERBOARD</p>
                    <h2>{challengeTitle}</h2>
                  </div>
                  <span>{overview?.unlocked ? `${leaderboardEntries.length} PLAYERS` : "LOCKED"}</span>
                </header>

                {overviewLoading && !overview ? (
                  <p className="today-hub-empty">Loading challenge leaderboard…</p>
                ) : !overview?.unlocked ? (
                  <p className="today-hub-empty">Finish this challenge to unlock the leaderboard and everyone’s completed result.</p>
                ) : leaderboardEntries.length ? (
                  <div className="today-hub-leaderboard__rows">
                    {leaderboardEntries.map((entry) => (
                      <button
                        className={`today-hub-leaderboard__row${entry.isCurrentUser ? " is-current" : ""}`}
                        key={entry.profileId}
                        type="button"
                        aria-label={`View ${entry.displayName}'s result`}
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
              </>
            )}
          </div>
        </div>

        <div className="today-hub__pager" aria-label="MLB challenge carousel controls">
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

      <section className="mlb-play-standings" aria-label="MLB Play standings">
        <header>
          <div>
            <p className="eyebrow">PLAY STANDINGS</p>
            <h2>Postseason Challenge Race</h2>
          </div>
          <span>{championship ? `${championship.playMax} PTS` : "25 PTS"}</span>
        </header>

        {championshipLoading && !championship ? (
          <p className="today-hub-empty">Loading Play standings…</p>
        ) : playStandings.length ? (
          <div className="mlb-play-standings__rows">
            <div className="mlb-play-standings__header" aria-hidden="true">
              <span>Rank</span>
              <span>Member</span>
              <span>Play Points</span>
            </div>
            {playStandings.map((entry) => (
              <div
                className={`mlb-play-standings__row${entry.is_current_user ? " is-current" : ""}`}
                key={entry.profile_id}
              >
                <b>#{entry.play_rank}</b>
                <strong>{entry.display_name}</strong>
                <span>
                  {formatChampionshipPoints(entry.play_points)}
                  <small> / {championship?.playMax ?? 25}</small>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="today-hub-empty">
            {hubLoading ? "Loading Play standings…" : "Play standings will appear when the first challenge is completed."}
          </p>
        )}
      </section>
    </div>
  );
}
