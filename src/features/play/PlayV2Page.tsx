import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createFootballGmMatchRepository } from "./footballGmMatchRepository";
import { createWheelFootballRepository } from "./wheelFootballRepository";
import { DailyAnswerDetail } from "./TodayChallengeHub";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { challengeCounterpartId, challengeDirection, challengeStatus } from "../challenges/challengeModel";
import { challengePlayRoute, challengeSport } from "../challenges/challengeRuntime";
import { useIdentity } from "../identity/IdentityProvider";
import { isDailyRankKeepCombo } from "./DailyRankKeepComboStatus";
import { WeeklyOverallChampionBanner } from "./WeeklyOverallChampionBanner";
import { playLandingDestination, playLandingGameIds } from "./PlayLandingPresentation";
import { playGameDefinition, type PlaySport } from "./playRegistry";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";
import { FootballSpecialDailyHubMark, footballSpecialDailyStyle, footballSpecialDailyThemeForDay } from "./footballSpecialDailyTheme";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";
import { useTodayChallengeOverview } from "./useTodayChallengeOverview";
import { usePlayV2History } from "./usePlayV2History";
import { playV2Score } from "./playV2Stats";
import "../../styles/play-v2.css";
import "../../styles/football-special-daily.css";

const GAME_COPY: Record<string, string> = {
  "gm-football": "Build a three-year dynasty",
  "wheel-football": "Spin. Draft. Compete.",
  "wheel-ufc": "Build your fight roster",
  "draft-room": "Outbid your rivals",
  "auction": "Build your collection",
  "find-leader": "Find the hidden statistical leader",
  "who-am-i": "Guess from the clues",
  "higher-lower": "Head-to-head comparisons",
};

function shortName(title: string) {
  return title === "Wheel of Football" ? "Wheel of Football" : title === "Wheel of UFC" ? "Wheel of UFC" : title;
}

function DailyCompact({ sport, profileId }: { sport: PlaySport; profileId: string }) {
  const navigate = useNavigate();
  const runtime = useTodayChallengeRuntime({ profileId, enabled: true, sport });
  const overview = useTodayChallengeOverview({
    profileId, enabled: true, projection: runtime.projection, sport,
  });
  const projection = runtime.projection;
  const specialTheme = sport === "football" && projection ? footballSpecialDailyThemeForDay(projection.centralDay) : null;
  const adapter = todayChallengeAdapter(projection?.gameType);
  const title = projection && isDailyRankKeepCombo(projection)
    ? "Blind Rank + Keep/Cut" : adapter?.title ?? "Today's Challenge";
  const completed = Boolean(projection?.officialAttempt);
  const saved = !completed && Boolean(projection?.progressRevision);
  const dailyRoute = sport === "football" ? "/football/today" : adapter?.dailyRoute ?? "/play";
  const ownPlace = overview.leaderboard?.entries.find((entry) => entry.isCurrentUser)?.rank;
  const [showResults, setShowResults] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const selectedEntry = overview.leaderboard?.entries.find((entry) => entry.profileId === selectedProfileId) ?? null;
  return (
    <section className="play-v2__daily" aria-label="Today's Challenge" data-sport={sport}
      data-special-daily={specialTheme?.rivalryAccent ? "red-river" : specialTheme ? "team" : undefined}
      style={specialTheme ? footballSpecialDailyStyle(specialTheme) : undefined}>
      <div className="play-v2__section-top">
        <span>TODAY'S CHALLENGE</span>
        <span className="play-v2__daily-status">{completed ? "COMPLETE" : saved ? "IN PROGRESS" : "OFFICIAL DAILY"}</span>
      </div>
      {runtime.loading && !projection ? (
        <p className="play-v2__muted" role="status">Loading today's official game…</p>
      ) : !projection || !adapter ? (
        <div className="play-v2__error">
          <p>{runtime.error instanceof Error ? runtime.error.message : "Today's official game is unavailable."}</p>
          <button type="button" onClick={() => void runtime.refresh()}>TRY AGAIN ↗</button>
          <Link to={sport === "football" ? "/football/today" : "/play"}>OPEN DAILY PAGE →</Link>
        </div>
      ) : (
        <>
          {specialTheme ? <FootballSpecialDailyHubMark theme={specialTheme} /> : null}
          <div className="play-v2__daily-row">
            <div className="play-v2__daily-title">
              <h2>{title}</h2>
              <span>{completed
                ? ownPlace ? "#" + ownPlace + " today" : "Official result saved"
                : saved ? "Your progress is saved" : "One official attempt · save as you play"}</span>
            </div>
            {completed ? (
              <div className="play-v2__daily-score"><strong>{projection.officialAttempt?.normalizedScore}</strong><span>/100</span></div>
            ) : (
              <span className="play-v2__daily-arrow" aria-hidden="true">↗</span>
            )}
          </div>
          <div className="play-v2__daily-actions">
            <button type="button" onClick={() => navigate(dailyRoute)}>
              {completed ? "VIEW RESULT" : saved ? "RESUME DAILY" : "PLAY TODAY"} →
            </button>
            <button type="button" onClick={() => setShowResults((wasOpen) => !wasOpen)}
              aria-expanded={showResults} aria-controls="play-v2-daily-leaders">
              {showResults ? "HIDE" : "TODAY'S STANDINGS"} ↗
            </button>
          </div>
          {specialTheme?.videoUrl ? (
            <a className="play-v2__rivalry-video" href={specialTheme.videoUrl}
              target="_blank" rel="noopener noreferrer" aria-label="Watch the Red River rivalry video on YouTube">
              <span>RED RIVER EDITION</span><strong>WATCH RIVALRY VIDEO ↗</strong>
            </a>
          ) : null}
          {showResults ? (
            <div id="play-v2-daily-leaders" className="play-v2__daily-leaders">
              {overview.leaderboardLoading ? <p>Loading standings…</p>
                : !overview.leaderboard?.unlocked ? <p>Finish today's official game to unlock standings.</p>
                  : !overview.leaderboard.entries.length ? <p>No completed standings yet.</p>
                    : overview.leaderboard.entries.slice().sort((a, b) => a.rank - b.rank).map((entry) => (
                      <button key={entry.profileId} type="button" className="play-v2__leader-row"
                        aria-label={"View " + entry.displayName + "'s official Daily result"}
                        onClick={() => setSelectedProfileId(entry.profileId)}>
                        <span><b>#{entry.rank}</b> {entry.isCurrentUser ? "You" : entry.displayName}</span>
                        <strong>{entry.normalizedScore}/100</strong>
                      </button>
                    ))}
            </div>
          ) : null}
          {selectedEntry ? <DailyAnswerDetail entry={selectedEntry} projection={projection}
            sport={sport} onClose={() => setSelectedProfileId(null)} /> : null}
        </>
      )}
    </section>
  );
}

function PerformancePreview({ sport, profileId }: { sport: PlaySport; profileId: string }) {
  const { performance, loading, error, refresh } = usePlayV2History(sport, profileId);
  return (
    <section className="play-v2__performance" aria-label="Your Play Performance">
      <div className="play-v2__section-top">
        <span>YOUR PLAY PERFORMANCE</span>
        <Link to={sport === "football" ? "/football/play-stats" : "/play/stats"}>FULL STATS ↗</Link>
      </div>
      {loading ? <p className="play-v2__muted" role="status">Loading your official scores…</p> :
        error ? <div className="play-v2__error"><p>Official score history is unavailable.</p><button type="button" onClick={() => void refresh()}>RETRY</button></div> :
          performance && performance.count > 0 ? (
            <>
              <div className="play-v2__metrics">
                <div><span>DAILY AVERAGE</span><strong>{playV2Score(performance.average)}</strong><small>/100</small></div>
                <div><span>COMPLETED</span><strong>{performance.count}</strong><small>official games</small></div>
                <div><span>PERSONAL BEST</span><strong>{performance.best}</strong><small>/100</small></div>
              </div>

            </>
          ) : <p className="play-v2__muted">No completed official dailies yet. Your stats will appear after your first result.</p>}
    </section>
  );
}

function MatchupsCompact({ sport }: { sport: PlaySport }) {
  const { activeProfile, profiles, challenges, loading, error, refresh, markOpened, viewResults,
    dismissChallenge, cancelPendingAuction } = usePlayChallenges();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const handledCode = useRef("");
  const navigate = useNavigate();
  const wheelRepository = useMemo(() => createWheelFootballRepository(), []);
  const gmRepository = useMemo(() => createFootballGmMatchRepository(), []);
  const requestedCode = searchParams.get("challenge")?.trim().toUpperCase() ?? "";
  const allMatchups = useMemo(() => challenges
    .filter((challenge) => challengeSport(challenge) === sport
      && Boolean(activeProfile?.id)
      && (challenge.creatorId === activeProfile?.id || challenge.recipientId === activeProfile?.id)
      && !challenge.hiddenFor.includes(activeProfile!.id))
    .sort((a, b) => {
      const priority = (c: typeof a) => {
        const status = challengeStatus(c, activeProfile!.id);
        const direction = challengeDirection(c, activeProfile!.id);
        return status === "completed" || status === "declined" ? 4
          : direction === "received" && status === "new" ? 0
            : direction === "received" ? 1 : status === "opened" ? 2 : 3;
      };
      return priority(a) - priority(b) || b.createdAt.localeCompare(a.createdAt);
    }), [challenges, sport, activeProfile]);
  const openMatchups = allMatchups.filter((challenge) => {
    const status = challengeStatus(challenge, activeProfile!.id);
    return status !== "completed" && status !== "declined";
  });
  const visible = detailsOpen ? allMatchups : openMatchups.slice(0, 3);

  // Preserve shared challenge deep links without mounting the old Challenge Center.
  useEffect(() => {
    if (!requestedCode || !activeProfile || loading) return;
    const match = allMatchups.find((challenge) => challenge.code === requestedCode);
    if (!match) return;
    const key = activeProfile.id + ":" + requestedCode;
    if (handledCode.current === key) return;
    handledCode.current = key;
    const status = challengeStatus(match, activeProfile.id);
    const direction = challengeDirection(match, activeProfile.id);
    if (status === "completed" && !["gm-football", "wheel-football", "wheel-ufc", "auction", "draft-room"].includes(match.gameId)) {
      viewResults(match.code);
    } else if (direction === "received" || ["gm-football", "wheel-football", "wheel-ufc", "auction", "draft-room"].includes(match.gameId)) {
      if (direction === "received" && !["gm-football", "wheel-football", "wheel-ufc"].includes(match.gameId)) void markOpened(match.code);
      navigate(challengePlayRoute(match), { replace: true });
    } else {
      setDetailsOpen(true);
    }
  }, [activeProfile, allMatchups, loading, markOpened, navigate, requestedCode, viewResults]);

  function openMatch(challenge: typeof allMatchups[number]) {
    if (!activeProfile) return;
    const status = challengeStatus(challenge, activeProfile.id);
    const direction = challengeDirection(challenge, activeProfile.id);
    const serverOwned = ["gm-football", "wheel-football", "wheel-ufc", "auction", "draft-room"].includes(challenge.gameId);
    if (status === "completed" && !serverOwned) {
      viewResults(challenge.code);
    } else if (serverOwned || direction === "received") {
      if (direction === "received" && !["gm-football", "wheel-football", "wheel-ufc"].includes(challenge.gameId)) {
        void markOpened(challenge.code);
      }
      navigate(challengePlayRoute(challenge));
    } else {
      setDetailsOpen(true);
    }
  }

  async function removeMatch(challenge: typeof allMatchups[number]) {
    if (!activeProfile || busyCode) return;
    setBusyCode(challenge.code);
    try {
      const status = challengeStatus(challenge, activeProfile.id);
      const direction = challengeDirection(challenge, activeProfile.id);
      if (direction === "sent" && status === "waiting" && ["auction", "draft-room"].includes(challenge.gameId)) {
        await cancelPendingAuction(challenge);
      } else if (["gm-football", "wheel-football"].includes(challenge.gameId)
        && (status === "waiting" && direction === "sent" || status === "new" && direction === "received")) {
        if (challenge.gameId === "gm-football") await gmRepository?.cancel(challenge.code);
        else await wheelRepository?.decline(challenge.code);
        await refresh();
      } else {
        await dismissChallenge(challenge.code);
      }
    } finally {
      setBusyCode(null);
    }
  }

  function statusLabel(challenge: typeof allMatchups[number]) {
    const status = challengeStatus(challenge, activeProfile!.id);
    const direction = challengeDirection(challenge, activeProfile!.id);
    const turnBased = ["gm-football", "wheel-football", "wheel-ufc"].includes(challenge.gameId);
    if (status === "completed") return "Completed · view results";
    if (status === "declined") return "Ended";
    if (direction === "received" && status === "new") return "Your response needed · accept invitation";
    if (turnBased && status === "opened") return "Match in progress · check whose turn";
    if (direction === "received") return "Your turn · finish the challenge";
    if (status === "waiting") return "Invitation pending · waiting for opponent";
    return "Waiting for opponent's result";
  }

  return (
    <section id="challenge-center" className="play-v2__matchups" aria-label="Your Matchups">
      <div className="play-v2__section-top">
        <span>YOUR MATCHUPS</span>
        <button type="button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen}>
          {detailsOpen ? "SHOW LESS" : "VIEW ALL"} ↗
        </button>
      </div>
      {detailsOpen ? (
        <div className="play-v2__matchup-tools">
          <span>{allMatchups.length} total · {openMatchups.length} active</span>
          <button type="button" disabled={loading} onClick={() => void refresh()}>REFRESH ↻</button>
        </div>
      ) : null}
      {error ? <p className="play-v2__muted" role="status">{error} <button type="button" onClick={() => void refresh()}>RETRY</button></p> : null}
      {loading && !allMatchups.length ? <p className="play-v2__muted">Loading your matchups…</p> :
        !visible.length ? <p className="play-v2__muted">{detailsOpen ? "No matchups yet." : "No open matchups. Challenge a friend from the Game Room."}</p> :
          <div className="play-v2__matchup-list">
            {visible.map((challenge) => {
              const partner = profiles.find((p) => p.id === challengeCounterpartId(challenge, activeProfile!.id));
              const status = challengeStatus(challenge, activeProfile!.id);
              const direction = challengeDirection(challenge, activeProfile!.id);
              const ended = status === "completed" || status === "declined";
              const cancellable = status === "new" && direction === "received" || status === "waiting" && direction === "sent";
              const canRemove = detailsOpen && (ended || cancellable || !["gm-football", "wheel-football", "wheel-ufc", "auction", "draft-room"].includes(challenge.gameId));
              return (
                <div className="play-v2__matchup-item" key={challenge.code}>
                  <button type="button" className="play-v2__matchup-row" onClick={() => openMatch(challenge)}
                    aria-label={challenge.gameTitle + " vs " + (partner?.displayName ?? "Friend") + " · " + statusLabel(challenge)}>
                    <span className="play-v2__matchup-avatar">
                      {partner?.avatarPhotoData ? <img src={partner.avatarPhotoData} alt="" /> : partner?.initials ?? "HQ"}
                    </span>
                    <span className="play-v2__matchup-copy">
                      <strong>{challenge.gameTitle} vs {partner?.displayName ?? "Friend"}</strong>
                      <small>{statusLabel(challenge)}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                  {canRemove ? (
                    <button type="button" className="play-v2__matchup-remove" disabled={busyCode === challenge.code}
                      onClick={() => void removeMatch(challenge)}>
                      {cancellable ? direction === "received" ? "DECLINE" : "CANCEL" : "REMOVE"}
                    </button>
                  ) : null}
                </div>
              );
            })}
            {!detailsOpen && openMatchups.length > 3 ? (
              <button type="button" className="play-v2__more" onClick={() => setDetailsOpen(true)}>
                VIEW {openMatchups.length - 3} MORE MATCHUPS →
              </button>
            ) : null}
          </div>
      }
    </section>
  );
}

function WeeklyCurrent({}: Record<string, never>) {
  return (
    <section className="play-v2__weekly" aria-label="Weekly Featured Championship">
      <div className="play-v2__section-top">
        <span><span aria-hidden="true">🏆 </span> WEEKLY FEATURED</span>
        <span>FOOTBALL</span>
      </div>
      <h2>Auction Center</h2>
      <p>Make your picks in this week’s featured football auction.</p>
      <div className="play-v2__weekly-actions">
        <Link to="/football/weekly-auction">OPEN CURRENT WEEKLY →</Link>
        <Link to="/championship/football?tab=play">PLAY STANDINGS ↗</Link>
      </div>
    </section>
  );
}

function GameRoom({ sport }: { sport: PlaySport }) {
  const navigate = useNavigate();
  const games = playLandingGameIds(sport).map((id) => playGameDefinition(id, sport));
  return (
    <section className="play-v2__room" aria-label="Game Room">
      <div className="play-v2__room-heading">
        <div><span>ALL GAMES</span><h2>Game Room</h2></div>
        <span>{games.length} GAMES</span>
      </div>
      <div className="play-v2__room-grid">
        {games.map((game) => (
          <button type="button" key={game.id} className="play-v2__game"
            onClick={() => navigate(playLandingDestination(sport, game.id))}>
            <span className="play-v2__game-mark" aria-hidden="true">{game.icon}</span>
            <strong>{shortName(game.title)}</strong>
            <small>{GAME_COPY[game.id] ?? game.description}</small>
            <span className="play-v2__game-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PlayV2Page({ sport }: { sport: PlaySport }) {
  const identity = useIdentity();
  const profileId = identity.status === "ready" ? identity.profile?.id : null;
  return (
    <div className="page play-v2" data-sport={sport} data-testid="play-v2-hub">
      {profileId ? <WeeklyOverallChampionBanner sport={sport} /> : null}
      <header className="play-v2__heading">
        <div><span>{sport === "football" ? "FOOTBALL" : "UFC"} PLAY</span><h1>Play</h1></div>
      </header>
      {sport === "football" ? <WeeklyCurrent /> : null}
      {profileId ? (
        <>
          <DailyCompact sport={sport} profileId={profileId} />
          <PerformancePreview sport={sport} profileId={profileId} />
          <MatchupsCompact sport={sport} />
        </>
      ) : (
        <section className="play-v2__daily" aria-label="Today's Challenge" data-sport={sport}>
          <div className="play-v2__section-top">
            <span>TODAY'S CHALLENGE</span>
            <span className="play-v2__daily-status">OFFICIAL DAILY</span>
          </div>
          {identity.status === "loading" ? (
            <p className="play-v2__muted" role="status">Loading your HQ profile…</p>
          ) : (
            <>
              <h2>Play today's challenge</h2>
              <p className="play-v2__muted">Sign in to compete in official Dailies, see standings, and track your career results.</p>
              {identity.status === "unconfigured" ? (
                <p className="play-v2__muted">Profiles are temporarily unavailable.</p>
              ) : (
                <div className="play-v2__daily-actions">
                  <button type="button" onClick={identity.openDialog}>SIGN IN OR JOIN →</button>
                </div>
              )}
            </>
          )}
        </section>
      )}
      <GameRoom sport={sport} />
    </div>
  );
}
