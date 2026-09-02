import { Link } from "react-router-dom";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { eventPicksLocked, groupRankLabel, pickProgress, pickRecord } from "../picks/picksModel";
import { pickEventPosters } from "../picks/picksEventAssets";
import { footballMatchupBreakdownsForEvent } from "../picks/footballMatchupBreakdowns";
import { footballDateTimeLabel } from "../picks/footballTime";

function isCollegeGame(weightClass: string) {
  const value = weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB";
}

function featuredGameForBreakdown(event: PickEvent, breakdownId: string) {
  return event.bouts.find((game) => footballMatchupBreakdownsForEvent({ ...event, bouts: [game] })
    .some((breakdown) => breakdown.id === breakdownId)) ?? null;
}

function FeaturedGame({
  breakdownId,
  title,
  game,
  poster,
}: {
  breakdownId: string;
  title: string;
  game: NonNullable<ReturnType<typeof featuredGameForBreakdown>>;
  poster?: { src: string; aspectRatio: string };
}) {
  const label = isCollegeGame(game.weightClass) ? "COLLEGE GAME OF THE WEEK" : "NFL GAME OF THE WEEK";

  return (
    <Link
      className={`football-hq-feature${poster ? " has-poster" : ""}`}
      to={`/football/picks?matchup=${encodeURIComponent(breakdownId)}`}
    >
      {poster ? (
        <img src={poster.src} alt="" style={{ aspectRatio: poster.aspectRatio }} loading="lazy" />
      ) : null}
      <div className="football-hq-feature__scrim" aria-hidden="true" />
      <div className="football-hq-feature__copy">
        <span>{label}</span>
        <strong>{title}</strong>
        <p>{footballDateTimeLabel(game.locksAt ?? "")}</p>
        <b>OPEN MATCHUP →</b>
      </div>
    </Link>
  );
}

export function FootballHq({
  event,
  selections,
  history,
  summary,
  loading,
  error,
  signedIn,
}: {
  event: PickEvent | null;
  selections: Readonly<Record<string, string>>;
  history: PickHistory;
  summary: PickSummary;
  loading: boolean;
  error: string;
  signedIn: boolean;
}) {
  const progress = pickProgress(event, selections);
  const remaining = Math.max(0, progress.total - progress.completed);
  const locked = event ? eventPicksLocked(event) : false;
  const standings = history?.seasonStandings ?? [];
  const standing = standings.find((item) => item.isCurrentUser) ?? null;
  const rank = standing ? groupRankLabel(standing.rank, standings) : "";
  const posters = pickEventPosters(event);
  const matchupBreakdowns = footballMatchupBreakdownsForEvent(event);
  const featuredMatchups = event ? matchupBreakdowns.flatMap((breakdown, index) => {
    const game = featuredGameForBreakdown(event, breakdown.id);
    return game ? [{ breakdown, game, poster: posters[index] }] : [];
  }) : [];
  const season = event?.season ?? history?.season ?? new Date().getFullYear();
  const status = !signedIn
    ? "SIGN IN TO PICK"
    : locked
      ? "PICKS LOCKED"
      : progress.total > 0 && remaining === 0
        ? "PICKS READY"
        : progress.total > 0
          ? `${remaining} PICK${remaining === 1 ? "" : "S"} LEFT`
          : "SLATE OPEN";

  return (
    <section
      className="home-section home-sport-hq home-sport-hq--football home-section--football-hq"
      data-testid="home-section"
      data-home-section="football-hq"
      aria-label="Football HQ"
    >
      <header className="home-sport-hq__heading">
        <div>
          <p className="eyebrow">FOOTBALL HQ</p>
          <h2>This week</h2>
        </div>
        <small>PICKS · COLLEGE · NFL</small>
      </header>

      {event ? (
        <section className="surface-card football-hq-week" aria-labelledby="football-hq-week-title">
          <div className="football-hq-week__topline">
            <span>THIS WEEK</span>
            <small>{locked ? "LOCKED" : "LIVE SLATE"}</small>
          </div>
          <h3 id="football-hq-week-title">{event.name}</h3>
          <div className="football-hq-week__scoreboard">
            <div>
              <span>YOUR PICKS</span>
              <strong>{signedIn ? `${progress.completed} / ${progress.total}` : "—"}</strong>
              <small>{status}</small>
            </div>
            <div>
              <span>{season} STANDING</span>
              <strong>{signedIn && rank ? `#${rank}` : "—"}</strong>
              <small>{standing ? `${standing.totalPoints} PTS · ${pickRecord(summary)}` : signedIn ? pickRecord(summary) : "SIGN IN TO TRACK"}</small>
            </div>
          </div>
          <Link className="football-hq-week__action" to="/football/picks">OPEN PICKS →</Link>
        </section>
      ) : (
        <section className="surface-card football-hq-week football-hq-week--empty" aria-labelledby="football-hq-week-title">
          <div className="football-hq-week__topline">
            <span>THIS WEEK</span>
            <small>{loading ? "LOADING" : error ? "UNAVAILABLE" : "WAITING"}</small>
          </div>
          <h3 id="football-hq-week-title">{loading ? "Loading this week’s slate" : error ? "Football slate unavailable" : "Next slate not published"}</h3>
          <p>{error || "The next Football Picks slate will appear here when it is published."}</p>
          <Link className="football-hq-week__action" to="/football/picks">OPEN PICKS →</Link>
        </section>
      )}

      {featuredMatchups.length ? (
        <div className="football-hq-features" aria-label="Football Games of the Week">
          {featuredMatchups.map(({ breakdown, game, poster }) => (
            <FeaturedGame
              key={breakdown.id}
              breakdownId={breakdown.id}
              title={breakdown.title}
              game={game}
              poster={poster}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
