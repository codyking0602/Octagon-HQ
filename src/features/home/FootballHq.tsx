import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useOptionalPlayChallenges } from "../challenges/ChallengeProvider";
import { challengeIsHidden, type PlayChallenge } from "../challenges/challengeModel";
import { challengeSport } from "../challenges/challengeRuntime";
import { footballCfbTeamMediaId } from "../back-room/footballMediaIdentity";
import { footballTeamSchoolMetadataFor } from "../back-room/footballTeamSchoolMetadata";
import { footballTeamAssets } from "../back-room/footballSubjectAssets";
import type { FootballMatchupBreakdown } from "../picks/footballMatchupBreakdowns";
import { footballMatchupBreakdownsForEvent } from "../picks/footballMatchupBreakdowns";
import { footballPublishedSpotlight, mergeFootballWeeklyMatchupBreakdowns, publishedFootballMatchupsForEvent, usePublishedFootballWeek, type PublishedFootballWeek } from "./footballWeeklyPublication";
import { footballDateTimeLabel } from "../picks/footballTime";
import { footballSpotlightForDisplay } from "./footballSpotlightPresentation";
import { footballTeamSportsReferenceUrl } from "./footballTeamSportsReference";
import { footballPlayerSportsReferenceUrl } from "./footballPlayerSportsReference";
import type { PickBout, PickEvent, PickHistory, PickSummary } from "../picks/picksModel";
import { eventPicksLocked, groupRankLabel, pickProgress, pickRecord } from "../picks/picksModel";
import { picksSeasonStandings } from "../picks/picksSeasonStandings";
import type { DailyChallengeChampionshipSnapshot } from "../play/dailyChallengeChampionship";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  footballSpotlightKindAt,
  footballSpotlightPairAt,
  footballDitkaMemorialIsActive,
  FOOTBALL_DITKA_MEMORIAL_PHOTO,
  FOOTBALL_DITKA_MEMORIAL_SPOTLIGHT,
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
  cream: "#F5F1E8",
  crimson: "#9E1B32",
  garnet: "#73000A",
  gold: "#D4A72C",
  gray: "#8A8D8F",
  green: "#0B5D3B",
  maroon: "#5D1725",
  navy: "#041E42",
  orange: "#C65D11",
  purple: "#4F2683",
  red: "#BA0C2F",
  scarlet: "#BB0000",
  silver: "#A5ACAF",
  teal: "#006D75",
  white: "#FFFFFF",
  yellow: "#F9D84A",
};

const TEAM_COLOR_OVERRIDES: Readonly<Record<string, string>> = {
  "Buffalo Bills:red": "#C60C30",
  "Detroit Lions:blue": "#0076B6",
  "New York Giants:blue": "#0B2265",
  "New York Giants:red": "#A71930",
  "Pittsburgh Steelers:black": "#101820",
  "Pittsburgh Steelers:gold": "#FFB612",
  "Cincinnati Bengals:orange": "#FB4F14",
  "LSU:purple": "#461D7C",
  "LSU:gold": "#FDD023",
  "Kansas City Chiefs:gold": "#E31837",
  "Las Vegas Raiders:black": "#000000",
  "New Orleans Saints:gold": "#D3BC8D",
  "Ole Miss:navy": "#14213D",
  "Oregon:yellow": "#044520",
  "Texas:orange": "#BF5700",
  "USC:gold": "#990000",
};

const HOME_LOGO_NEUTRALS = new Set(["white", "cream", "gray", "silver"]);
// Neutral colors remain eligible secondary accents: Texas orange gets a white
// stripe, just as the Cowboys get silver, without turning the pill background white.
const FEATURED_SECONDARY_OVERRIDES: Readonly<Record<string, string>> = {
  "Kansas City Chiefs": "#FFB81C",
  Oregon: "#FEE123",
  USC: "#FFC72C",
};
const HOME_WHITE_LOGO_TEAMS = new Set(["Alabama", "Mississippi State", "Texas"]);
const FOOTBALL_HQ_LOGO_OVERRIDES: Readonly<Record<string, string>> = {
  Oregon: "https://a.espncdn.com/i/teamlogos/ncaa/500-dark/2483.png",
};

function footballPaletteColor(team: string, token: string): string {
  return TEAM_COLOR_OVERRIDES[`${team}:${token}`] ?? SEMANTIC_TEAM_COLORS[token] ?? "#1F4E79";
}

function footballMeaningfulPalette(name: string): string[] {
  const metadata = footballTeamSchoolMetadataFor(name);
  return (metadata?.colors ?? [])
    .map((token) => footballPaletteColor(metadata!.name, token));
}

// CSS color-mix keeps the full official fill; choose a readable foreground
// instead of forcing white lettering onto gold/yellow teams.
function teamPillForeground(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#FFFFFF";
  const n = parseInt(match[1], 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const value = c / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? "#101418" : "#FFFFFF";
}

export function footballHqTeamPresentationFor(name: string) {
  const metadata = footballTeamSchoolMetadataFor(name);
  const canonicalName = metadata?.name ?? name;
  const colors = metadata?.colors ?? [];
  // Preserve the established team fill (e.g. Steelers gold, LSU gold).
  const backgroundToken = colors.slice(1).find((token) => !HOME_LOGO_NEUTRALS.has(token))
    ?? colors[0]
    ?? "blue";
  const color = footballPaletteColor(canonicalName, backgroundToken);
  const secondaryToken = colors.find((token) => token !== backgroundToken);
  const secondaryColor = FEATURED_SECONDARY_OVERRIDES[canonicalName]
    ?? (secondaryToken ? footballPaletteColor(canonicalName, secondaryToken) : null);

  return {
    color,
    secondaryColor,
    foregroundColor: teamPillForeground(color),
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

export function featuredGameForBreakdown(event: PickEvent, breakdownId: string, published: PublishedFootballWeek | null) {
  return event.bouts.find((game) => {
    const isolated = { ...event, bouts: [game] };
    return mergeFootballWeeklyMatchupBreakdowns(
      publishedFootballMatchupsForEvent(isolated, published),
      footballMatchupBreakdownsForEvent(isolated),
    ).some((breakdown) => breakdown.id === breakdownId);
  }) ?? null;
}

function normalizeTeamIdentity(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function logoForTeam(game: PickBout, team: FootballMatchupBreakdown["teams"][number]) {
  const metadata = footballTeamSchoolMetadataFor(team.name);
  const canonicalName = metadata?.name ?? team.name;
  const logoOverride = FOOTBALL_HQ_LOGO_OVERRIDES[canonicalName];
  if (logoOverride) return logoOverride;
  if (team.logoUrl) return team.logoUrl;

  const canonicalLogo = metadata?.level === "CFB"
    ? footballTeamAssets[footballCfbTeamMediaId(canonicalName)]?.src ?? null
    : null;
  const aliases = new Set(team.aliases.map(normalizeTeamIdentity));
  const homeSlug = normalizeTeamIdentity(game.homeTeamSlug ?? game.redFighterSlug);
  const awaySlug = normalizeTeamIdentity(game.awayTeamSlug ?? game.blueFighterSlug);
  if (aliases.has(homeSlug)) return game.homeTeamLogoUrl ?? canonicalLogo;
  if (aliases.has(awaySlug)) return game.awayTeamLogoUrl ?? canonicalLogo;
  return canonicalLogo;
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

/**
 * Keep long school/city names intact while giving nicknames a calmer second line.
 * This works for the live matchup each week, not a hardcoded pair of teams.
 */
function featuredGameTeamLabel(fullName: string, canonicalName: string) {
  const full = fullName.trim();
  const metadata = footballTeamSchoolMetadataFor(canonicalName);
  if (metadata?.level === "CFB") {
    const school = metadata.name;
    if (full.toLowerCase().startsWith(`${school.toLowerCase()} `)) {
      return { name: school, nickname: full.slice(school.length).trim() };
    }
    return { name: full, nickname: "" };
  }
  const lastSpace = full.lastIndexOf(" ");
  if (metadata?.level === "NFL" && lastSpace > 0) {
    return { name: full.slice(0, lastSpace), nickname: full.slice(lastSpace + 1) };
  }
  return { name: full, nickname: "" };
}

/** Resolve the secondary hue from canonical NFL/CFB metadata for every club.
 * Match against the server's player primary so the photo bar never repeats it. */
export function playerSpotlightSecondaryColor(spotlight: FootballPlayerSpotlight): string {
  const palette = footballMeaningfulPalette(spotlight.team);
  if (palette.length < 2) return spotlight.teamColor;
  const rgb = (hex: string) => {
    const value = /^#([0-9a-f]{6})$/i.exec(hex)?.[1];
    return value ? [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)) : null;
  };
  const primary = rgb(spotlight.teamColor);
  if (!primary) return palette[1];
  let nearest = 0;
  let shortest = Number.POSITIVE_INFINITY;
  palette.forEach((color, index) => {
    const candidate = rgb(color);
    if (!candidate) return;
    const distance = candidate.reduce((sum, value, channel) => sum + (value - primary[channel]) ** 2, 0);
    if (distance < shortest) { nearest = index; shortest = distance; }
  });
  return palette.find((_, index) => index !== nearest) ?? spotlight.teamColor;
}

function PlayerSpotlight({
  spotlight,
  photoSource,
  spotlightKind,
  canManagePhoto,
  onManagePhoto,
  memorial = false,
}: {
  spotlight: FootballPlayerSpotlight;
  photoSource: string | null;
  spotlightKind: FootballSpotlightKind;
  canManagePhoto: boolean;
  memorial?: boolean;
  onManagePhoto?: () => void;
}) {
  const holdTimer = useRef<number | null>(null);
  const managedByHold = useRef(false);
  const profileUrl = footballPlayerSportsReferenceUrl(spotlight.name, spotlightKind);

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
      managedByHold.current = true;
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

  const media = memorial ? (
    <div className="football-player-spotlight__media">{photo}</div>
  ) : (
    <a className={`football-player-spotlight__media${canManagePhoto ? " is-manageable" : ""}`}
      href={profileUrl} target="_blank" rel="noopener noreferrer"
      aria-label={`Open ${spotlight.name} 2026 ${spotlightKind === "cfb" ? "college" : "NFL"} player stats`}
      onPointerDown={() => { managedByHold.current = false; beginHold(); }}
      onPointerUp={clearHold} onPointerCancel={clearHold} onPointerLeave={clearHold}
      onClick={(event) => { if (managedByHold.current) { event.preventDefault(); managedByHold.current = false; } }}
      onContextMenu={(event) => { if (canManagePhoto) event.preventDefault(); }}
    >{photo}</a>
  );

  return (
    <article
      className={`football-player-spotlight${memorial ? " football-player-spotlight--memorial" : ""}`}
      aria-label={memorial ? "In memory of Mike Ditka" : "Football Player Spotlight"}
      style={{
        "--player-team-color": spotlight.teamColor,
        "--player-team-secondary": playerSpotlightSecondaryColor(spotlight),
      } as CSSProperties}
    >
      {media}
      <div className="football-player-spotlight__copy">
        <span>{memorial ? "IN MEMORY · 1939–2026" : "PLAYER SPOTLIGHT"}</span>
        <h3>{memorial ? spotlight.name : <a className="football-player-spotlight__name-link" href={profileUrl} target="_blank" rel="noopener noreferrer">{spotlight.name}</a>}</h3>
        <strong>{spotlight.team.toUpperCase()} · {spotlight.position}</strong>
        <div className="football-player-spotlight__stats" aria-label={memorial ? `${spotlight.name} career milestones` : `${spotlight.name} featured-game stats`}>
          {spotlight.stats.map((stat) => (
            <span key={stat.label}><b>{stat.value}</b><small>{stat.label}</small></span>
          ))}
        </div>
        <p className="football-player-spotlight__meta">
          <span>{spotlight.result}</span><span>{spotlight.measurements}</span>
        </p>
        <a href={spotlight.highlightUrl} target="_blank" rel="noreferrer">
          {memorial ? "REMEMBER IRON MIKE ↗" : "WATCH HIGHLIGHT ↗"}
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

function FeaturedGameTeamPill({
  team,
  game,
  presentation,
  name,
  nickname,
  level,
  season,
}: {
  team: FootballMatchupBreakdown["teams"][number];
  game: PickBout;
  presentation: ReturnType<typeof footballHqTeamPresentationFor>;
  name: string;
  nickname: string;
  level: "CFB" | "NFL";
  season: number;
}) {
  const url = footballTeamSportsReferenceUrl(team.name, level, season);
  const style = {
    "--team-color": presentation.color,
    "--team-secondary": presentation.secondaryColor ?? presentation.color,
    "--team-foreground": presentation.foregroundColor,
  } as CSSProperties;
  const contents = (
    <>
      <TeamMark logoUrl={logoForTeam(game, team)} name={team.name} logoTreatment={presentation.logoTreatment} />
      <span className="football-hq-game-row__team-label">
        <strong>{name}</strong>
        {nickname ? <small>{nickname}</small> : null}
      </span>
    </>
  );
  // Unknown teams are intentionally not sent to guessed/mismatched reference pages.
  return url ? (
    <a
      className="football-hq-game-row__team-pill"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${season} ${team.name} Sports Reference page`}
      style={style}
    >{contents}</a>
  ) : (
    <div className="football-hq-game-row__team-pill" style={style}>{contents}</div>
  );
}

function FeaturedGameRow({
  event,
  breakdown,
  game,
  compact = false,
}: {
  event: PickEvent;
  breakdown: FootballMatchupBreakdown;
  game: PickBout;
  compact?: boolean;
}) {
  const label = isCollegeGame(game.weightClass) ? "COLLEGE GAME OF THE WEEK" : "NFL GAME OF THE WEEK";
  const firstTeam = breakdown.teams[0];
  const secondTeam = breakdown.teams[1];
  const firstPresentation = footballHqTeamPresentationFor(firstTeam.name);
  const secondPresentation = footballHqTeamPresentationFor(secondTeam.name);
  const firstLabel = featuredGameTeamLabel(fullTeamNameForGame(game, firstTeam), firstTeam.name);
  const secondLabel = featuredGameTeamLabel(fullTeamNameForGame(game, secondTeam), secondTeam.name);

  const level = isCollegeGame(game.weightClass) ? "CFB" : "NFL";

  return (
    <article className="football-hq-game-row">
      <Link
        className="football-hq-game-row__breakdown-hit"
        to={`/football/picks?matchup=${encodeURIComponent(breakdown.id)}`}
        aria-label={`Open matchup breakdown for ${breakdown.title}`}
      />
      <div className="football-hq-game-row__main">
        <span>{compact ? level : label}</span>
        <div className="football-hq-game-row__teams">
          <FeaturedGameTeamPill team={firstTeam} game={game} presentation={firstPresentation}
            name={firstLabel.name} nickname={compact ? "" : firstLabel.nickname} level={level} season={event.season} />
          {!compact ? <b aria-hidden="true">VS</b> : null}
          <FeaturedGameTeamPill team={secondTeam} game={game} presentation={secondPresentation}
            name={secondLabel.name} nickname={compact ? "" : secondLabel.nickname} level={level} season={event.season} />
        </div>
      </div>
      <div className="football-hq-game-row__meta">
        <strong><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>{footballDateTimeLabel(breakdown.kickoffAt ?? game.locksAt ?? event.startsAt)}</strong>
        <b aria-hidden="true">{compact ? "›" : <>BREAKDOWN <span>→</span></>}</b>
      </div>
    </article>
  );
}

/** Count received, actionable Football challenges, not seen/read notifications. */
export function footballOutstandingChallengeCount(
  challenges: readonly PlayChallenge[],
  profileId: string,
  now = Date.now(),
) {
  if (!profileId) return 0;
  return challenges.filter((challenge) => (
    challenge.recipientId === profileId
    && challengeSport(challenge) === "football"
    && challenge.responderResult === null
    && !challenge.completedAt
    && !challenge.declinedAt
    && !challengeIsHidden(challenge, profileId)
    && new Date(challenge.expiresAt).getTime() > now
  )).length;
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
  compactPreview = false,
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
  compactPreview?: boolean;
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
  const playChallenges = useOptionalPlayChallenges();
  const incomingFootballChallenges = compactPreview && playChallenges?.activeProfile
    ? footballOutstandingChallengeCount(playChallenges.challenges, playChallenges.activeProfile.id)
    : 0;
  const published = usePublishedFootballWeek();

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
  const memorial = footballDitkaMemorialIsActive(spotlightNow);
  const publishedSport = published?.[activeSpotlightKind] ?? null;
  const activeSpotlight = footballSpotlightForDisplay(memorial ? FOOTBALL_DITKA_MEMORIAL_SPOTLIGHT
    : publishedSport ? footballPublishedSpotlight(publishedSport)
    : activePair.spotlights[activeSpotlightKind]);
  const activeSpotlightPhoto = memorial ? FOOTBALL_DITKA_MEMORIAL_PHOTO
    : publishedSport ? publishedSport.spotlight.photo_asset_path
    : activePairPhotos[activeSpotlightKind] ?? null;

  const progress = pickProgress(event, selections);
  const progressPercent = progress.total ? Math.round(progress.completed / progress.total * 100) : 0;
  const remaining = Math.max(0, progress.total - progress.completed);
  const settledSeasonPicks = summary.correct + summary.incorrect;
  const seasonWinPercentage = settledSeasonPicks > 0
    ? Math.round(100 * summary.correct / settledSeasonPicks) : null;
  const locked = event ? eventPicksLocked(event) : false;
  const standings = picksSeasonStandings(history, "football");
  const standing = standings.find((item) => item.isCurrentUser) ?? null;
  const rank = standing ? standingLabel(standing.rank, standings) : "";
  const matchupBreakdowns = event ? mergeFootballWeeklyMatchupBreakdowns(
    publishedFootballMatchupsForEvent(event, published ?? null),
    footballMatchupBreakdownsForEvent(event),
  ) : [];
  const featuredMatchups = event ? matchupBreakdowns.flatMap((breakdown) => {
    const game = featuredGameForBreakdown(event, breakdown.id, published ?? null);
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
      className={`home-section home-sport-hq home-sport-hq--football home-section--football-hq${compactPreview ? " football-hq--compact-preview" : ""}`}
      data-testid="home-section"
      data-home-section="football-hq"
      aria-label="Football HQ"
    >
      <header className="home-sport-hq__heading">
        {compactPreview ? (
          <>
            <h2 className="football-hq__center-title">FOOTBALL HQ</h2>
            {incomingFootballChallenges > 0 ? (
              <Link className="football-hq__challenge-alert" to="/football#challenge-center"
                aria-label={`${incomingFootballChallenges} outstanding Football challenge${incomingFootballChallenges === 1 ? "" : "s"}; open Challenge Center`}>
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"/><path d="M8 10h8m-8 4h5"/>
                </svg>
                <b>{incomingFootballChallenges > 9 ? "9+" : incomingFootballChallenges}</b>
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">FOOTBALL HQ</p>
              <h2>This week</h2>
            </div>
            <small>PICKS · COLLEGE · NFL</small>
          </>
        )}
      </header>

      <section className="surface-card home-event-card home-event-card--compact" aria-label="Football Picks and standing">
        <div className="home-event-card__topline">
          <p className="eyebrow">FOOTBALL PICKS</p>
          {!compactPreview ? <span>{event ? locked ? "LOCKED" : "ACTIVE" : loading ? "LOADING" : error ? "UNAVAILABLE" : "WAITING"}</span> : null}
        </div>
        {compactPreview ? (
          <div className="football-hq-compact-picks" aria-label="Football picks summary">
            <div className="football-hq-compact-picks__completion">
              <small>YOUR PICKS</small>
              <strong>{signedIn && event ? `${progress.completed} OF ${progress.total}` : "—"}</strong>
              {status !== "PICKS LOCKED" ? <span>{status}</span> : null}
            </div>
            <Link className="football-hq-compact-picks__record" to="/championship/football?tab=picks"
              aria-label="Open Football Championship Picks leaderboard">
              <small>{season} PICKS RECORD</small>
              <strong>{signedIn ? pickRecord(summary) : "—"}</strong>
              <span>{!signedIn ? "SIGN IN TO TRACK" : seasonWinPercentage === null ? "NO RESULTS YET" : `${seasonWinPercentage}% WIN RATE`}</span>
            </Link>
            <Link className="football-hq-compact-picks__action" to="/football/picks">{locked ? "VIEW PICKS →" : "OPEN PICKS →"}</Link>
          </div>
        ) : (
          <>
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
            to="/championship/football?tab=picks"
            aria-label="Open Football Championship Picks leaderboard"
          >
            <span>{season} PICKS RECORD</span>
            <b>{signedIn ? pickRecord(summary) : "—"}</b>
            <small>{standing ? `${standing.totalPoints} PTS` : signedIn ? "NO RESULTS YET" : "SIGN IN TO TRACK"}</small>
          </Link>
        </div>
        <Link className="secondary-action" to="/football/picks">OPEN PICKS →</Link>
          </>
        )}
      </section>

      {dailyChallenge}

      <div style={{ opacity: published === undefined && !memorial ? 0 : 1 }}>
        <PlayerSpotlight
          spotlight={activeSpotlight}
          spotlightKind={activeSpotlightKind}
          photoSource={activeSpotlightPhoto}
          memorial={memorial}
          canManagePhoto={!memorial && canManagePlayerPhoto}
          onManagePhoto={memorial ? undefined : onManagePlayerPhoto}
        />
      </div>

      {featuredMatchups.length ? (
        <section className="football-hq-games" aria-label="Football Games of the Week">
          <header>
            <span>{compactPreview ? "FEATURED GAMES" : "TOP GAMES THIS WEEK"}</span>
            {compactPreview ? <Link className="football-hq-games__schedule-link" to="/football/picks">SCHEDULE →</Link>
              : <small>{event ? weekLabel(event) : "THIS WEEK"}</small>}
          </header>
          <div className="football-hq-games__list">
            {featuredMatchups.map(({ breakdown, game }) => (
              <FeaturedGameRow
                key={breakdown.id}
                event={event!}
                breakdown={breakdown}
                game={game}
                compact={compactPreview}
              />
            ))}
          </div>
          {!compactPreview ? <Link className="football-hq-games__schedule" to="/football/picks">VIEW FULL SCHEDULE →</Link> : null}
        </section>
      ) : null}
    </section>
  );
}
