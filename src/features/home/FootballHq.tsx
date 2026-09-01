import { Link } from "react-router-dom";
import type { PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { eventPicksLocked, groupRankLabel, pickProgress, pickRecord } from "../picks/picksModel";
import { pickEventPosters } from "../picks/picksEventAssets";

function eventDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isCollegeGame(weightClass: string) {
  const value = weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB";
}

function weeklyLeagueGame(event: PickEvent | null, league: "cfb" | "nfl") {
  return event?.bouts
    .filter((game) => game.includedInPicks !== false)
    .slice()
    .sort((left, right) => left.position - right.position)
    .find((game) => (league === "cfb" ? isCollegeGame(game.weightClass) : !isCollegeGame(game.weightClass))) ?? null;
}

function FeaturedGame({
  label,
  game,
  poster,
}: {
  label: string;
  game: ReturnType<typeof weeklyLeagueGame>;
  poster?: { src: string; aspectRatio: string };
}) {
  return (
    <Link className={`football-hq-feature${poster ? " has-poster" : ""}`} to="/football/picks">
      {poster ? (
        <img src={poster.src} alt="" style={{ aspectRatio: poster.aspectRatio }} loading="lazy" />
      ) : null}
      <div className="football-hq-feature__scrim" aria-hidden="true" />
      <div className="football-hq-feature__copy">
        <span>{label}</span>
        {game ? (
          <>
            <strong>{game.blueFighterName} <small>AT</small> {game.redFighterName}</strong>
            <p>{game.locksAt ? eventDate(game.locksAt) : "This week"}</p>
          </>
        ) : (
          <>
            <strong>Weekly feature</strong>
            <p>Opens when this week’s matchup is published.</p>
          </>
        )}
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
  const collegeGame = weeklyLeagueGame(event, "cfb");
  const nflGame = weeklyLeagueGame(event, "nfl");
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
      className="home-section home-section--football-hq"
      data-testid="home-section"
      data-home-section="football-hq"
      aria-label="Football HQ"
    >
      <header className="football-hq-heading">
        <div>
          <p className="eyebrow">FOOTBALL HQ</p>
          <h2>Saturday to Sunday</h2>
          <p>The weekly slate, both featured matchups, and your season standing.</p>
        </div>
        <span aria-hidden="true">HQ</span>
      </header>

      {event ? (
        <section className="surface-card football-hq-week" aria-labelledby="football-hq-week-title">
          <div className="football-hq-week__topline">
            <span>THIS WEEK</span>
            <small>{locked ? "LOCKED" : "LIVE SLATE"}</small>
          </div>
          <h3 id="football-hq-week-title">{event.name}</h3>
          <p>{event.subtitle || eventDate(event.startsAt)}</p>
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
          <Link className="football-hq-week__action" to="/football/picks">OPEN FOOTBALL PICKS →</Link>
        </section>
      ) : (
        <section className="surface-card football-hq-week football-hq-week--empty" aria-labelledby="football-hq-week-title">
          <div className="football-hq-week__topline">
            <span>THIS WEEK</span>
            <small>{loading ? "LOADING" : error ? "UNAVAILABLE" : "WAITING"}</small>
          </div>
          <h3 id="football-hq-week-title">{loading ? "Loading this week’s slate" : error ? "Football slate unavailable" : "Next slate not published"}</h3>
          <p>{error || "The next Football Picks slate will appear here when it is published."}</p>
          <Link className="football-hq-week__action" to="/football/picks">OPEN FOOTBALL PICKS →</Link>
        </section>
      )}

      <div className="football-hq-features" aria-label="Football Games of the Week">
        <FeaturedGame label="COLLEGE GAME OF THE WEEK" game={collegeGame} poster={posters[0]} />
        <FeaturedGame label="NFL GAME OF THE WEEK" game={nflGame} poster={posters[1]} />
      </div>
    </section>
  );
}