export type FootballWeekLeague = "nfl" | "college-football";
type Json = Record<string, any>;

export interface FootballWeekGamePreview {
  espn_event_id: string;
  league: FootballWeekLeague;
  name: string;
  kickoff_at: string;
  home_team_name: string;
  away_team_name: string;
  home_rank: number | null;
  away_rank: number | null;
  candidate_rank?: number;
}

export interface FootballWeekPreview {
  week_start: string;
  week_end: string;
  required_college_count: number;
  nfl_games: FootballWeekGamePreview[];
  college_candidates: FootballWeekGamePreview[];
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("week_start must be a Tuesday in YYYY-MM-DD format");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.valueOf()) || isoDate(date) !== value || date.getUTCDay() !== 2) {
    throw new Error("week_start must be a Tuesday in YYYY-MM-DD format");
  }
  return date;
}

export function footballWeekRange(weekStart: string) {
  const start = parseIsoDate(weekStart);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return isoDate(date);
  });
  return { weekStart: dates[0], weekEnd: dates[6], dates };
}

function teamRank(competitor: Json) {
  const rank = Number(competitor?.curatedRank?.current);
  return Number.isInteger(rank) && rank >= 1 && rank <= 25 ? rank : null;
}

function previewFromEvent(event: Json, league: FootballWeekLeague): FootballWeekGamePreview | null {
  const competition = event?.competitions?.[0];
  const competitors = Array.isArray(competition?.competitors) ? competition.competitors : [];
  const home = competitors.find((competitor: Json) => competitor?.homeAway === "home");
  const away = competitors.find((competitor: Json) => competitor?.homeAway === "away");
  const kickoff = String(competition?.date ?? event?.date ?? "");
  const homeName = String(home?.team?.displayName ?? home?.team?.shortDisplayName ?? "").trim();
  const awayName = String(away?.team?.displayName ?? away?.team?.shortDisplayName ?? "").trim();
  const eventId = String(event?.id ?? "").trim();
  if (!/^\d+$/.test(eventId) || !homeName || !awayName || !Number.isFinite(Date.parse(kickoff))) return null;
  return {
    espn_event_id: eventId,
    league,
    name: `${awayName} at ${homeName}`,
    kickoff_at: new Date(kickoff).toISOString(),
    home_team_name: homeName,
    away_team_name: awayName,
    home_rank: teamRank(home),
    away_rank: teamRank(away),
  };
}

function eligibleSeason(event: Json) {
  const seasonType = Number(event?.season?.type);
  return !Number.isFinite(seasonType) || seasonType !== 1;
}

export function summarizeFootballWeekEvents(events: Json[], league: FootballWeekLeague) {
  const byId = new Map<string, FootballWeekGamePreview>();
  for (const event of events) {
    if (!eligibleSeason(event)) continue;
    const preview = previewFromEvent(event, league);
    if (preview) byId.set(preview.espn_event_id, preview);
  }
  return [...byId.values()].sort((a, b) => a.kickoff_at.localeCompare(b.kickoff_at) || a.espn_event_id.localeCompare(b.espn_event_id));
}

function candidateScore(game: FootballWeekGamePreview) {
  const ranks = [game.home_rank, game.away_rank].filter((rank): rank is number => rank !== null);
  if (ranks.length === 2) return 100_000 + ranks.reduce((sum, rank) => sum + (26 - rank) * 1_000, 0);
  if (ranks.length === 1) return 50_000 + (26 - ranks[0]) * 1_000;
  return 0;
}

export function rankCollegeFootballCandidates(events: Json[], limit = 12) {
  return summarizeFootballWeekEvents(events, "college-football")
    .sort((a, b) => candidateScore(b) - candidateScore(a) || a.kickoff_at.localeCompare(b.kickoff_at) || a.espn_event_id.localeCompare(b.espn_event_id))
    .slice(0, Math.max(0, limit))
    .map((game, index) => ({ ...game, candidate_rank: index + 1 }));
}

export function buildFootballWeekPreview(weekStart: string, nflEvents: Json[], collegeEvents: Json[]): FootballWeekPreview {
  const range = footballWeekRange(weekStart);
  const collegeCandidates = rankCollegeFootballCandidates(collegeEvents, 12);
  return {
    week_start: range.weekStart,
    week_end: range.weekEnd,
    required_college_count: Math.min(8, collegeCandidates.length),
    nfl_games: summarizeFootballWeekEvents(nflEvents, "nfl"),
    college_candidates: collegeCandidates,
  };
}
