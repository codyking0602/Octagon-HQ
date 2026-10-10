import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { challengeCounterpartId, challengeDirection, challengeStatus } from "../challenges/challengeModel";
import { challengePlayRoute, challengeSport } from "../challenges/challengeRuntime";
import { useIdentity } from "../identity/IdentityProvider";
import { isDailyRankKeepCombo } from "./DailyRankKeepComboStatus";
import { WeeklyOverallChampionBanner } from "./WeeklyOverallChampionBanner";
import { playLandingDestination, playLandingGameIds } from "./PlayLandingPresentation";
import { playGameDefinition, type PlaySport } from "./playRegistry";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";
import { useTodayChallengeOverview } from "./useTodayChallengeOverview";
import { usePlayV2History } from "./usePlayV2History";
import { playV2Score } from "./playV2Stats";
import "../../styles/play-v2.css";

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
  const adapter = todayChallengeAdapter(projection?.gameType);
  const title = projection && isDailyRankKeepCombo(projection)
    ? "Blind Rank + Keep/Cut" : adapter?.title ?? "Today's Challenge";
  const completed = Boolean(projection?.officialAttempt);
  const saved = !completed && Boolean(projection?.progressRevision);
  const dailyRoute = sport === "football" ? "/football/today" : adapter?.dailyRoute ?? "/play";
  const ownPlace = overview.leaderboard?.entries.find((entry) => entry.isCurrentUser)?.rank;
  const [showResults, setShowResults] = useState(false);
  return (
    <section className="play-v2__daily" aria-label="Today's Challenge" data-sport={sport}>
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
          {showResults ? (
            <div id="play-v2-daily-leaders" className="play-v2__daily-leaders">
              {overview.leaderboardLoading ? <p>Loading standings…</p>
                : !overview.leaderboard?.unlocked ? <p>Finish today's official game to unlock standings.</p>
                  : !overview.leaderboard.entries.length ? <p>No completed standings yet.</p>
                    : overview.leaderboard.entries.slice().sort((a, b) => a.rank - b.rank).map((entry) => (
                      <div key={entry.profileId}>
                        <span><b>#{entry.rank}</b> {entry.isCurrentUser ? "You" : entry.displayName}</span>
                        <strong>{entry.normalizedScore}/100</strong>
                      </div>
                    ))}
            </div>
          ) : null}
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
              <div className="play-v2__mini-history">
                <div className="play-v2__trend-label">
                  <span>LAST {performance.recent.length} RESULTS</span>
                  <small>{performance.previousFiveAverage != null && performance.lastFiveAverage != null
                    ? (performance.lastFiveAverage >= performance.previousFiveAverage ? "+" : "")
                      + playV2Score(performance.lastFiveAverage - performance.previousFiveAverage) + " vs prior five"
                    : "Official normalized scores"}</small>
                </div>
                <div className="play-v2__history-bars" role="img" aria-label={"Recent official scores, oldest first: " + performance.recent.slice().reverse().map((row) => row.normalizedScore).join(", ")}>
                  {performance.recent.slice().reverse().map((attempt, index) => (
                    <span key={attempt.day + ":" + attempt.gameType + ":" + attempt.completedAt + ":" + index}
                      style={{ height: Math.max(3, attempt.normalizedScore) + "%" }}
                      title={attempt.day + " · " + attempt.normalizedScore + "/100"} />
                  ))}
                </div>
              </div>
            </>
          ) : <p className="play-v2__muted">No completed official dailies yet. Your stats will appear after your first result.</p>}
    </section>
  );
}

function MatchupsCompact({ sport }: { sport: PlaySport }) {
  const { activeProfile, profiles, challenges, loading, error } = usePlayChallenges();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const relevant = useMemo(() => challenges
    .filter((challenge) => challengeSport(challenge) === sport
      && Boolean(activeProfile?.id)
      && (challenge.creatorId === activeProfile?.id || challenge.recipientId === activeProfile?.id))
    .filter((challenge) => {
      const status = challengeStatus(challenge, activeProfile!.id);
      return status !== "completed" && status !== "declined";
    })
    .sort((a, b) => {
      const priority = (c: typeof a) => {
        const direction = challengeDirection(c, activeProfile!.id);
        const status = challengeStatus(c, activeProfile!.id);
        return direction === "received" && status === "new" ? 0
          : direction === "received" ? 1 : status === "opened" ? 2 : 3;
      };
      return priority(a) - priority(b) || b.createdAt.localeCompare(a.createdAt);
    }), [challenges, sport, activeProfile]);
  return (
    <section className="play-v2__matchups" aria-label="Your Matchups">
      <div className="play-v2__section-top">
        <span>YOUR MATCHUPS</span>
        <button type="button" onClick={() => setDetailsOpen((v) => !v)} aria-expanded={detailsOpen}>
          {detailsOpen ? "CLOSE" : "MANAGE ALL"} ↗
        </button>
      </div>
      {loading ? <p className="play-v2__muted">Loading your matchups…</p> :
        error ? <p className="play-v2__muted">Matchups could not be refreshed. Open Manage All to retry.</p> :
          relevant.length === 0 ? <p className="play-v2__muted">No open matchups. Challenge a friend from the Game Room.</p> :
            <div className="play-v2__matchup-list">
              {relevant.slice(0, 3).map((challenge) => {
                const partner = profiles.find((p) => p.id === challengeCounterpartId(challenge, activeProfile!.id));
                const direction = challengeDirection(challenge, activeProfile!.id);
                const status = challengeStatus(challenge, activeProfile!.id);
                return (
                  <button key={challenge.code} type="button" className="play-v2__matchup-row" onClick={() => navigate(challengePlayRoute(challenge))}>
                    <span className="play-v2__matchup-avatar">{partner?.initials ?? "HQ"}</span>
                    <span className="play-v2__matchup-copy"><strong>{challenge.gameTitle} vs {partner?.displayName ?? "Friend"}</strong>
                      <small>{direction === "received" ? status === "new" ? "Your response is needed" : "Opened · see match"
                        : status === "waiting" ? "Waiting for them to accept" : "Waiting for their result"}</small></span>
                    <span aria-hidden="true">↗</span>
                  </button>
                );
              })}
              {relevant.length > 3 ? <p className="play-v2__more">{relevant.length - 3} more open matchups in Manage All</p> : null}
            </div>
      }
      <div className="play-v2__challenge-details" hidden={!detailsOpen}><ChallengeCenter sport={sport} /></div>
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
      <p>Current Featured competition. Your weekly GM three-run championship is being developed separately.</p>
      <div className="play-v2__weekly-actions">
        <Link to="/football/weekly-auction">OPEN CURRENT WEEKLY →</Link>
        <Link to="/championship/football?tab=play">PLAY STANDINGS ↗</Link>
      </div>
    </section>
  );
}

function GameRoom({ sport }: { sport: PlaySport }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const games = playLandingGameIds(sport).map((id) => playGameDefinition(id, sport));
  const visible = showAll ? games : games.slice(0, 4);
  return (
    <section className="play-v2__room" aria-label="Game Room">
      <div className="play-v2__room-heading">
        <div><span>ALL GAMES</span><h2>Game Room</h2></div>
        {games.length > 4 ? <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? "SHOW LESS" : "VIEW ALL"} ↗
        </button> : <span>{games.length} GAMES</span>}
      </div>
      <div className="play-v2__room-grid">
        {visible.map((game) => (
          <button type="button" key={game.id} className="play-v2__game"
            onClick={() => navigate(playLandingDestination(sport, game.id))}>
            <span className="play-v2__game-mark" aria-hidden="true">{game.icon}</span>
            <strong>{shortName(game.title)}</strong>
            <small>{GAME_COPY[game.id] ?? game.description}</small>
            <span className="play-v2__game-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
        {sport === "football" ? (
          <button type="button" className="play-v2__game is-preview" onClick={() => navigate("/football/gm-cfb-preview")}>
            <span className="play-v2__game-mark" aria-hidden="true">GM</span>
            <strong>The GM · College</strong><small>Owner playtest · CFB dynasty</small>
            <span className="play-v2__game-arrow" aria-hidden="true">↗</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default function PlayV2Page({ sport, onClassic }: { sport: PlaySport; onClassic: () => void }) {
  const identity = useIdentity();
  const profileId = identity.profile?.id;
  if (!profileId || identity.profile?.canControlPicks !== true) return null;
  return (
    <div className="page play-v2" data-sport={sport} data-testid="owner-play-v2">
      <WeeklyOverallChampionBanner sport={sport} />
      <header className="play-v2__heading">
        <div><span>{sport === "football" ? "FOOTBALL" : "UFC"} HQ · OWNER PREVIEW</span><h1>Play</h1></div>
        <button type="button" onClick={onClassic}>CLASSIC PLAY ↗</button>
      </header>
      {sport === "football" ? <WeeklyCurrent /> : null}
      <DailyCompact sport={sport} profileId={profileId} />
      <PerformancePreview sport={sport} profileId={profileId} />
      <MatchupsCompact sport={sport} />
      <GameRoom sport={sport} />
    </div>
  );
}
