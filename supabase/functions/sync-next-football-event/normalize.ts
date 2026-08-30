export interface FootballTeam {
  id: string;
  name: string;
  abbreviation: string;
  homeAway: "home" | "away";
}

export interface NormalizedFootballEvent {
  source: "espn+the-odds-api";
  source_event_key: string;
  source_url: string;
  sport: "football";
  league: string;
  event_kind: "game";
  event_id: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  locks_at: string;
  season: number;
  bouts: Array<{
    bout_id: string;
    position: 1;
    weight_class: string;
    red_fighter_slug: string;
    red_fighter_name: string;
    blue_fighter_slug: string;
    blue_fighter_name: string;
    home_team_slug: string;
    away_team_slug: string;
    spread_home: number;
    spread_source: "the-odds-api";
    spread_updated_at: string;
    card_segment: "main";
    segment_sequence: 1;
    included: true;
  }>;
}

export interface NormalizedFootballFinalResult {
  source: "espn";
  source_event_key: string;
  sport: "football";
  league: string;
  starts_at: string;
  home_team_slug: string;
  away_team_slug: string;
  home_final_score: number;
  away_final_score: number;
}

type Json = Record<string, any>;

function slug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function teamOf(competitor: Json): FootballTeam {
  const team = competitor?.team ?? {};
  const name = String(team.displayName ?? team.shortDisplayName ?? "").trim();
  if (!name || !["home", "away"].includes(competitor?.homeAway)) throw new Error("ESPN game has invalid teams");
  return { id: String(team.id ?? ""), name, abbreviation: String(team.abbreviation ?? ""), homeAway: competitor.homeAway };
}

function gameContext(espnEvent: Json) {
  const competition = espnEvent?.competitions?.[0];
  const competitors = (competition?.competitors ?? []).map((competitor: Json) => ({ competitor, team: teamOf(competitor) }));
  const home = competitors.find((entry: { team: FootballTeam }) => entry.team.homeAway === "home");
  const away = competitors.find((entry: { team: FootballTeam }) => entry.team.homeAway === "away");
  const startsAt = String(competition?.date ?? espnEvent?.date ?? "");
  if (!home || !away || !espnEvent?.id || !Number.isFinite(Date.parse(startsAt))) throw new Error("ESPN game is incomplete");
  return { competition, home, away, startsAt, gameSlug: `${slug(away.team.name)}-${slug(home.team.name)}` };
}

function finalScore(competitor: Json) {
  const raw = competitor?.score;
  if (raw === null || raw === undefined || String(raw).trim() === "") throw new Error("ESPN final score is incomplete");
  const score = Number(raw);
  if (!Number.isInteger(score) || score < 0) throw new Error("ESPN final score is invalid");
  return score;
}

function oddsNameMatches(team: FootballTeam, candidate: unknown) {
  const value = slug(String(candidate ?? ""));
  return value === slug(team.name) || (!!team.abbreviation && value === slug(team.abbreviation));
}

export function normalizeFootballFinalResult(espnEvent: Json, league: string): NormalizedFootballFinalResult | null {
  const competition = espnEvent?.competitions?.[0];
  if (competition?.status?.type?.completed !== true) return null;
  const context = gameContext(espnEvent);
  return {
    source: "espn",
    source_event_key: `espn:${espnEvent.id}`,
    sport: "football",
    league: league.toLowerCase(),
    starts_at: new Date(context.startsAt).toISOString(),
    home_team_slug: slug(context.home.team.name),
    away_team_slug: slug(context.away.team.name),
    home_final_score: finalScore(context.home.competitor),
    away_final_score: finalScore(context.away.competitor),
  };
}

export function normalizeFootballEvent(espnEvent: Json, oddsEvents: Json[], league: string): NormalizedFootballEvent {
  const context = gameContext(espnEvent);
  const { competition, startsAt, gameSlug } = context;
  const home = context.home.team;
  const away = context.away.team;

  const oddsEvent = oddsEvents.find((event) =>
    oddsNameMatches(home, event.home_team) && oddsNameMatches(away, event.away_team));
  const spreads = oddsEvent?.bookmakers?.flatMap((book: Json) =>
    (book.markets ?? []).filter((market: Json) => market.key === "spreads")
      .map((market: Json) => ({ updated: book.last_update, outcomes: market.outcomes }))) ?? [];
  const usable = spreads.find((market: Json) => market.outcomes?.some((outcome: Json) => oddsNameMatches(home, outcome.name)));
  const homeLine = usable?.outcomes?.find((outcome: Json) => oddsNameMatches(home, outcome.name))?.point;
  if (!Number.isFinite(homeLine) || !usable?.updated) throw new Error("The Odds API has no matching ATS line");

  const venue = competition?.venue ?? {};
  const address = venue.address ?? {};
  const season = Number(espnEvent?.season?.year ?? new Date(startsAt).getUTCFullYear());
  return {
    source: "espn+the-odds-api", source_event_key: `espn:${espnEvent.id}`,
    source_url: String(espnEvent?.links?.[0]?.href ?? "https://www.espn.com/football/"),
    sport: "football", league: league.toLowerCase(), event_kind: "game",
    event_id: `${league.toLowerCase()}-${gameSlug}-${startsAt.slice(0, 10)}`,
    name: `${away.name} at ${home.name}`, subtitle: String(espnEvent?.shortName ?? ""),
    venue: String(venue.fullName ?? "TBD"),
    location: [address.city, address.state].filter(Boolean).join(", ") || "TBD",
    starts_at: new Date(startsAt).toISOString(), locks_at: new Date(startsAt).toISOString(), season,
    bouts: [{
      bout_id: gameSlug, position: 1, weight_class: `${league.toUpperCase()} ATS`,
      red_fighter_slug: slug(home.name), red_fighter_name: home.name,
      blue_fighter_slug: slug(away.name), blue_fighter_name: away.name,
      home_team_slug: slug(home.name), away_team_slug: slug(away.name), spread_home: homeLine,
      spread_source: "the-odds-api", spread_updated_at: new Date(usable.updated).toISOString(),
      card_segment: "main", segment_sequence: 1, included: true,
    }],
  };
}
