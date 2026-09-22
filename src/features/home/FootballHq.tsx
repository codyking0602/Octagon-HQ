import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { footballTeamSchoolMetadataFor } from "../back-room/footballTeamSchoolMetadata";
import type { FootballMatchupBreakdown } from "../picks/footballMatchupBreakdowns";
import { footballMatchupBreakdownsForEvent } from "../picks/footballMatchupBreakdowns";
import { footballDateTimeLabel } from "../picks/footballTime";
import type { PickBout, PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { eventPicksLocked, groupRankLabel, pickProgress, pickRecord } from "../picks/picksModel";
import { picksSeasonStandings } from "../picks/picksSeasonStandings";
import type { DailyChallengeChampionshipSnapshot } from "../play/dailyChallengeChampionship";
import { WeeklyGamesStandingLink } from "./WeeklyGamesStandingLink";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  footballSpotlightKindAt,
  footballSpotlightPairAt,
  type FootballPlayerSpotlight,
  type FootballSpotlightKind,
  type FootballSpotlightPhotoSources,
} from "./footballPlayerSpotlightSchedule";

export { footballSpotlightKindAt } from "./footballPlayerSpotlightSchedule";
export const FOOTBALL_PLAYER_SPOTLIGHTS = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[0].spotlights;

function normalizedSpotlightPhotoSources(
  sources: FootballSpotlightPhotoSources | Readonly<Partial<Record<FootballSpotlightKind, string | null>>>,
): FootballSpotlightPhotoSources {
  if ("cfb" in sources || "nfl" in sources) {
    return {
      [FOOTBALL_BASE_SPOTLIGHT_PAIR_ID]: sources as Readonly<Partial<Record<FootballSpotlightKind, string | null>>>,
    };
  }
  return sources as FootballSpotlightPhotoSources;
}

const SEMANTIC_TEAM_COLORS: Readonly<Record<string, string>> = {
  aqua: "#008E97",
  black: "#171717",
  blue: "#174A7E",
  brown: "#311D00",
  burgundy: "#5A1414",
  cardinal: "#8C1515",
  crimson: "#9E1B32",
  garnet: "#73000A",
  gold: "#D4A72C",
  green: "#0B5D3B",
  maroon: "#5D1725",
  navy: "#041E42",
  orange: "#C65D11",
  purple: "#4F2683",
  red: "#BA0C2F",
  scarlet: "#BB0000",
  teal: "#006D75",
};

const TEAM_COLOR_OVERRIDES: Readonly<Record<string, string>> = {
  "Buffalo Bills:red": "#C60C30",
  "Detroit Lions:blue": "#0076B6",
  "LSU:gold": "#FDD023",
  "Las Vegas Raiders:black": "#000000",
  "New Orleans Saints:gold": "#D3BC8D",
  "Ole Miss:navy": "#14213D",
  "Oregon:yellow": "#FEE123",
  "Texas:orange": "#BF5700",
  "USC:gold": "#FFC72C",
};

const HOME_LOGO_NEUTRALS = new Set(["white", "cream", "gray", "silver"]);
const HOME_WHITE_LOGO_TEAMS = new Set(["Texas"]);

export function footballHqTeamPresentationFor(name: string) {
  const metadata = footballTeamSchoolMetadataFor(name);
  const canonicalName = metadata?.name ?? name;
  const colors = metadata?.colors ?? [];
  const backgroundToken = colors.slice(1).find((color) => !HOME_LOGO_NEUTRALS.has(color))
    ?? colors[0]
    ?? "blue";
  const color = TEAM_COLOR_OVERRIDES[`${canonicalName}:${backgroundToken}`]
    ?? SEMANTIC_TEAM_COLORS[backgroundToken]
    ?? "#1F4E79";

  return {
    color,
    logoTreatment: HOME_WHITE_LOGO_TEAMS.has(canonicalName) ? "white" as const : "full-color" as const,
  };
}

function standingLabel(rank: number, standings: readonly { rank: number }[]) {
  const label = groupRankLabel(rank, standings);
  return label.startsWith("T-") ? label : `#${label}`;
}

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

function fullTeamNameForGame(game: PickBout, team: FootballMatchupBreakdown["teams"][number]) {
  const aliases = new Set(team.aliases.map(normalizeTeamIdentity));
  const homeSlug = normalizeTeamIdentity(game.homeTeamSlug ?? game.redFighterSlug);
  const awaySlug = normalizeTeamIdentity(game.awayTeamSlug ?? game.blueFighterSlug);
  const redSlug = normalizeTeamIdentity(game.redFighterSlug);
  const blueSlug = normalizeTeamIdentity(game.blueFighterSlug);

  const matchedSlug = aliases.has(homeSlug) ? homeSlug : aliases.has(awaySlug) ? awaySlug : null;
  if (matchedSlug === redSlug) return game.redFighterName;
  if (matchedSlug === blueSlug) return game.blueFighterName;
  return team.name;
}

function PlayerSpotlight({
  spotlight,
  photoSource,
  canManagePhoto,
  onManagePhoto,
}: {
  spotlight: FootballPlayerSpotlight;
  photoSource: string | null;
  canManagePhoto: boolean;
  onManagePhoto?: () => void;
}) {
  const holdTimer = useRef<number | null>(null);

  function clearHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function beginHold() {
    if (!canManagePhoto || !onManagePhoto) return;
    clearHold();
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      onManagePhoto();
    }, 650);
  }

  useEffect(() => clearHold, []);

  const initials = spotlight.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const photo = photoSource
    ? <img src={photoSource} alt={spotlight.name} loading="lazy" />
    : <span className="football-player-spotlight__placeholder" aria-hidden="true">{initials}</span>;

  const media = canManagePhoto ? (
    <button
      className="football-player-spotlight__media is-manageable"
      type="button"
      aria-label="Manage player spotlight photo"
      onPointerDown={beginHold}
      onPointerUp={clearHold}
      onPointerCancel={clearHold}
      onPointerLeave={clearHold}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onManagePhoto) {
          event.preventDefault();
          onManagePhoto();
        }
      }}
    >
      {photo}
    </button>
  ) : (
    <div className="football-player-spotlight__media">{photo}</div>
  );

  return (
    <article
      className="football-player-spotlight"
      aria-label="Football Player Spotlight"
      style={{ "--player-team-color": spotlight.teamColor } as CSSProperties}
    >
      {media}
      <div className="football-player-spotlight__copy">
        <span>PLAYER SPOTLIGHT</span>
        <h3>{spotlight.name}</h3>
        <strong>{spotlight.team.toUpperCase()} · {spotlight.position}</strong>
        <div className="football-player-spotlight__stats" aria-label={`${spotlight.name} featured-game stats`}>
          {spotlight.stats.map((stat) => (
            <span key={stat.label}><b>{stat.value}</b><small>{stat.label}</small></span>
          ))}
        </div>
        <p className="football-player-spotlight__meta">
          {spotlight.result} · {spotlight.measurements}
        </p>
        <a href={spotlight.highlightUrl} target="_blank" rel="noreferrer">
          WATCH HIGHLIGHT ↗
        </a>
      </div>
    </article>
  );
}

function TeamMark({
  logoUrl,
  name,
  logoTreatment,
}: {
  logoUrl: string | null;
  name: string;
  logoTreatment: "full-color" | "white";
}) {
  return (
    <span
      className={`football-hq-team-mark${logoUrl ? "" : " is-empty"}${logoTreatment === "white" ? " is-white-logo" : ""}`}
      aria-hidden="true"
    >
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
  const firstPresentation = footballHqTeamPresentationFor(firstTeam.name);
  const secondPresentation = footballHqTeamPresentationFor(secondTeam.name);

  return (
    <Link
      className="football-hq-game-row"
      to={`/football/picks?matchup=${encodeURIComponent(breakdown.id)}`}
      aria-label={`Open matchup breakdown for ${breakdown.title}`}
    >
      <div className="football-hq-game-row__main">
        <span>{label}</span>
        <div className="football-hq-game-row__teams">
          <div style={{ "--team-color": firstPresentation.color } as CSSProperties}>
            <TeamMark
              logoUrl={logoForTeam(game, firstTeam)}
              name={firstTeam.name}
              logoTreatment={firstPresentation.logoTreatment}
            />
            <strong>{fullTeamNameForGame(game, firstTeam)}</strong>
          </div>
          <b>VS</b>
          <div style={{ "--team-color": secondPresentation.color } as CSSProperties}>
            <TeamMark
              logoUrl={logoForTeam(game, secondTeam)}
              name={secondTeam.name}
              logoTreatment={secondPresentation.logoTreatment}
            />
            <strong>{fullTeamNameForGame(game, secondTeam)}</strong>
          </div>
        </div>
      </div>
      <div className="football-hq-game-row__meta">
        <strong>{footballDateTimeLabel(game.locksAt ?? event.startsAt)}</strong>
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
  weeklyGames = null,
  weeklyGamesLoading = false,
  playerPhotoSources = {},
  canManagePlayerPhoto = false,
  onManagePlayerPhoto,
}: {
  event: PickEvent | null;
  selections: Readonly<Record<string, string>>;
  history: PickHistory;
  summary: PickSummary;
  loading: boolean;
  error: string;
  signedIn: boolean;
  dailyChallenge: ReactNode;
  weeklyGames?: DailyChallengeChampionshipSnapshot | null;
  weeklyGamesLoading?: boolean;
  playerPhotoSources?: FootballSpotlightPhotoSources | Readonly<Partial<Record<FootballSpotlightKind, string | null>>>;
  canManagePlayerPhoto?: boolean;
  onManagePlayerPhoto?: () => void;
}) {
  const [spotlightNow, setSpotlightNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setSpotlightNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const normalizedPhotoSources = normalizedSpotlightPhotoSources(playerPhotoSources);
  const activePair = footballSpotlightPairAt(spotlightNow, normalizedPhotoSources);
  const activePairPhotos = normalizedPhotoSources[activePair.id] ?? {};
  const scheduledSpotlightKind = footballSpotlightKindAt(spotlightNow);
  const alternateSpotlightKind: FootballSpotlightKind = scheduledSpotlightKind === "cfb" ? "nfl" : "cfb";
  const activeSpotlightKind = activePairPhotos[scheduledSpotlightKind]
    ? scheduledSpotlightKind
    : activePairPhotos[alternateSpotlightKind]
      ? alternateSpotlightKind
      : scheduledSpotlightKind;
  const activeSpotlight = activePair.spotlights[activeSpotlightKind];
  const activeSpotlightPhoto = activePairPhotos[activeSpotlightKind] ?? null;

  const progress = pickProgress(event, selections);
  const progressPercent = progress.total ? Math.round(progress.completed / progress.total * 100) : 0;
  const remaining = Math.max(0, progress.total - progress.completed);
  const locked = event ? eventPicksLocked(event) : false;
  const standings = picksSeasonStandings(history, "football");
  const standing = standings.find((item) => item.isCurrentUser) ?? null;
  const rank = standing ? standingLabel(standing.rank, standings) : "";
  const matchupBreakdowns = event ? footballMatchupBreakdownsForEvent(event) : [];
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
          <Link
            className="home-event-card__standing"
            to="/football/picks?view=standings#picks-season-leaderboard"
            aria-label="Open Football Picks season standings"
          >
            <span>{season} PICKS STANDING</span>
            <b>{signedIn && rank ? `${rank} OF ${standings.length}` : "—"}</b>
            <small>{standing ? `${standing.totalPoints} PTS · ${pickRecord(summary)}` : signedIn ? pickRecord(summary) : "SIGN IN TO TRACK"}</small>
          </Link>
        </div>
        <Link className="secondary-action" to="/football/picks">OPEN PICKS →</Link>
      </section>

      <WeeklyGamesStandingLink
        sport="football"
        standing={weeklyGames}
        loading={weeklyGamesLoading}
        signedIn={signedIn}
      />

      {dailyChallenge}

      <PlayerSpotlight
        spotlight={activeSpotlight}
        photoSource={activeSpotlightPhoto}
        canManagePhoto={canManagePlayerPhoto}
        onManagePhoto={onManagePlayerPhoto}
      />

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
