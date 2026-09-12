import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { FootballMatchupBreakdown } from "../picks/footballMatchupBreakdowns";
import { footballMatchupBreakdownsForEvent } from "../picks/footballMatchupBreakdowns";
import { footballDateTimeLabel } from "../picks/footballTime";
import type { PickBout, PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { eventPicksLocked, groupRankLabel, pickProgress, pickRecord } from "../picks/picksModel";

const PLAYER_SPOTLIGHT = {
  name: "Kamario Taylor",
  team: "Mississippi State",
  position: "QB",
  lastWeek: "413 TOT YDS · 5 TD",
  result: "VS ULM · W 62–13",
  measurements: "6'4\" · 230 LB",
  photoUrl: "https://images.sidearmdev.com/crop?height=680&type=webp&url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fmsstate.sidearmsports.com%2Fimages%2F2026%2F6%2F26%2FTaylor_Kamario_WEB_20260624_FB_ProductionDay_MM_0101.jpg&width=530",
  highlightUrl: "https://www.youtube.com/watch?v=QxpXjmhoaTE",
} as const;

function isCollegeGame(weightClass: string) {
  const value = weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB";
}

function featuredGameForBreakdown(event: PickEvent, breakdownId: string) {
  return event.bouts.find((game) => footballMatchupBreakdownsForEvent({ ...event, bouts: [game] })
    .some((breakdown) => breakdown.id === breakdownId)) ?? null;
}

function normalizeTeamIdentity(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function logoForTeam(game: PickBout, team: FootballMatchupBreakdown["teams"][number]) {
  const aliases = new Set(team.aliases.map(normalizeTeamIdentity));
  const homeSlug = normalizeTeamIdentity(game.homeTeamSlug ?? game.redFighterSlug);
  const awaySlug = normalizeTeamIdentity(game.awayTeamSlug ?? game.blueFighterSlug);
  if (aliases.has(homeSlug)) return game.homeTeamLogoUrl ?? null;
  if (aliases.has(awaySlug)) return game.awayTeamLogoUrl ?? null;
  return null;
}

function PlayerSpotlight() {
  return (
    <article className="football-player-spotlight" aria-label="Football Player Spotlight">
      <div className="football-player-spotlight__media">
        <img src={PLAYER_SPOTLIGHT.photoUrl} alt={PLAYER_SPOTLIGHT.name} loading="lazy" />
      </div>
      <div className="football-player-spotlight__copy">
        <span>PLAYER SPOTLIGHT</span>
        <h3>{PLAYER_SPOTLIGHT.name}</h3>
        <strong>{PLAYER_SPOTLIGHT.team.toUpperCase()} · {PLAYER_SPOTLIGHT.position}</strong>
        <b>LAST WEEK · {PLAYER_SPOTLIGHT.lastWeek}</b>
        <p>{PLAYER_SPOTLIGHT.result}</p>
        <small>{PLAYER_SPOTLIGHT.measurements}</small>
        <a href={PLAYER_SPOTLIGHT.highlightUrl} target="_blank" rel="noreferrer">
          WATCH HIGHLIGHT ↗
        </a>
      </div>
    </article>
  );
}

function TeamMark({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  return (
    <span className={`football-hq-team-mark${logoUrl ? "" : " is-empty"}`} aria-hidden="true">
      {logoUrl ? <img src={logoUrl} alt="" loading="lazy" /> : <b>{name.slice(0, 2).toUpperCase()}</b>}
    </span>
  );
}

function FeaturedGameRow({
  event,
  breakdown,
  game,
}: {
  event: PickEvent;
  breakdown: FootballMatchupBreakdown;
  game: PickBout;
}) {
  const label = isCollegeGame(game.weightClass) ? "COLLEGE GAME OF THE WEEK" : "NFL GAME OF THE WEEK";
  const firstTeam = breakdown.teams[0];
  const secondTeam = breakdown.teams[1];

  return (
    <Link
      className="football-hq-game-row"
      to={`/football/picks?matchup=${encodeURIComponent(breakdown.id)}`}
      aria-label={`Open matchup breakdown for ${breakdown.title}`}
    >
      <div className="football-hq-game-row__main">
        <span>{label}</span>
        <div className="football-hq-game-row__teams">
          <div>
            <TeamMark logoUrl={logoForTeam(game, firstTeam)} name={firstTeam.name} />
            <strong>{firstTeam.name}</strong>
          </div>
          <b>VS</b>
          <div>
            <TeamMark logoUrl={logoForTeam(game, secondTeam)} name={secondTeam.name} />
            <strong>{secondTeam.name}</strong>
          </div>
        </div>
      </div>
      <div className="football-hq-game-row__meta">
        <strong>{footballDateTimeLabel(game.locksAt ?? event.startsAt)}</strong>
        <span>{breakdown.venue}</span>
        <b>OPEN BREAKDOWN →</b>
      </div>
    </Link>
  );
}

function weekLabel(event: PickEvent) {
  const match = event.name.match(/week(?:\s+of)?\s+(.+)$/i);
  return match ? `WEEK OF ${match[1].toUpperCase()}` : "THIS WEEK";
}

export function FootballHq({
  event,
  selections,
  history,
  summary,
  loading,
  error,
  signedIn,
  dailyChallenge,
}: {
  event: PickEvent | null;
  selections: Readonly<Record<string, string>>;
  history: PickHistory;
  summary: PickSummary;
  loading: boolean;
  error: string;
  signedIn: boolean;
  dailyChallenge: ReactNode;
}) {
  const progress = pickProgress(event, selections);
  const progressPercent = progress.total ? Math.round(progress.completed / progress.total * 100) : 0;
  const remaining = Math.max(0, progress.total - progress.completed);
  const locked = event ? eventPicksLocked(event) : false;
  const standings = history?.seasonStandings ?? [];
  const standing = standings.find((item) => item.isCurrentUser) ?? null;
  const rank = standing ? groupRankLabel(standing.rank, standings) : "";
  const matchupBreakdowns = footballMatchupBreakdownsForEvent(event);
  const featuredMatchups = event ? matchupBreakdowns.flatMap((breakdown) => {
    const game = featuredGameForBreakdown(event, breakdown.id);
    return game ? [{ breakdown, game }] : [];
  }) : [];
  const season = event?.season ?? history?.season ?? new Date().getFullYear();
  const status = !signedIn
    ? "SIGN IN TO PLAY"
    : loading && !event
      ? "LOADING"
      : error && !event
        ? "UNAVAILABLE"
        : locked
          ? "PICKS LOCKED"
          : progress.total > 0 && remaining === 0
            ? "PICKS READY"
            : progress.total > 0
              ? `${remaining} PICK${remaining === 1 ? "" : "S"} LEFT`
              : "WAITING FOR SLATE";

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

      <section className="surface-card home-event-card home-event-card--compact" aria-label="Football Picks and standing">
        <div className="home-event-card__topline">
          <p className="eyebrow">FOOTBALL PICKS</p>
          <span>{event ? locked ? "LOCKED" : "ACTIVE" : loading ? "LOADING" : error ? "UNAVAILABLE" : "WAITING"}</span>
        </div>
        <div className="home-event-card__picks-grid">
          <div className="picks-progress" aria-label={`${progress.completed} of ${progress.total} football picks completed`}>
            <div>
              <span>YOUR PICKS</span>
              <b>{signedIn && event ? `${progress.completed} OF ${progress.total}` : "—"}</b>
            </div>
            <div className="picks-progress__track" aria-hidden="true"><span style={{ width: `${progressPercent}%` }} /></div>
            <small className="home-event-card__picks-status">{status}</small>
          </div>
          <div className="home-event-card__standing" aria-label="Football Picks season standing">
            <span>{season} STANDING</span>
            <b>{signedIn && rank ? `#${rank} OF ${standings.length}` : "—"}</b>
            <small>{standing ? `${standing.totalPoints} PTS · ${pickRecord(summary)}` : signedIn ? pickRecord(summary) : "SIGN IN TO TRACK"}</small>
          </div>
        </div>
        <Link className="secondary-action" to="/football/picks">OPEN PICKS →</Link>
      </section>

      {dailyChallenge}

      <PlayerSpotlight />

      {featuredMatchups.length ? (
        <section className="football-hq-games" aria-label="Football Games of the Week">
          <header>
            <span>TOP GAMES THIS WEEK</span>
            <small>{event ? weekLabel(event) : "THIS WEEK"}</small>
          </header>
          <div className="football-hq-games__list">
            {featuredMatchups.map(({ breakdown, game }) => (
              <FeaturedGameRow
                key={breakdown.id}
                event={event!}
                breakdown={breakdown}
                game={game}
              />
            ))}
          </div>
          <Link className="football-hq-games__schedule" to="/football/picks">VIEW FULL SCHEDULE →</Link>
        </section>
      ) : null}
    </section>
  );
}
