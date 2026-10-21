import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import { footballTeamSchoolMetadata, footballTeamSchoolMetadataFor } from "../back-room/footballTeamSchoolMetadata";
import { footballTeamSportsReferenceUrl } from "./footballTeamSportsReference";
import {
  footballWeeklyPreparedGameSchema,
  footballWeeklyPreparedSpotlightSchema,
  footballWeeklyEditorialProofSchema,
} from "./footballWeeklyContentRepository";
import type { FootballPlayerSpotlight, FootballSpotlightKind } from "./footballPlayerSpotlightSchedule";
import type { FootballMatchupBreakdown } from "../picks/footballMatchupBreakdowns";
import type { PickEvent } from "../picks/picksModel";

const publishedSport = z.object({
  week_of: z.iso.date(),
  release_at: z.iso.datetime({ offset: true }),
  spotlight: footballWeeklyPreparedSpotlightSchema,
  game: footballWeeklyPreparedGameSchema,
  breakdown: footballWeeklyEditorialProofSchema.shape.breakdown,
});
const publishedSchema = z.object({
  cfb: publishedSport.nullable(),
  nfl: publishedSport.nullable(),
});

export type PublishedFootballWeek = z.infer<typeof publishedSchema>;
export type PublishedFootballSport = NonNullable<PublishedFootballWeek["cfb"]>;

export function footballPublishedSpotlight(item: PublishedFootballSport): FootballPlayerSpotlight {
  return {
    name: item.spotlight.name,
    team: item.spotlight.team,
    position: item.spotlight.position,
    stats: item.spotlight.stats,
    result: item.spotlight.result,
    measurements: item.spotlight.measurements,
    teamColor: item.spotlight.team_color,
    highlightUrl: item.spotlight.highlight_url,
  };
}

/** Current-week AP snapshot from the Oct 18, 2026 NCAA/AP Top 25 poll.
 * https://www.ncaa.com/news/football/article/2026-10-18/miami-rises-no-1-texas-and-alabama-plummet-latest-ap-poll
 * Exact date AND both team identities are required to avoid leaking stale polls
 * into a future matchup. New weeks carry verified ranks/records in the canonical
 * prepared game, with no inference or fabricated 'NR' labels. */
const VERIFIED_OCT20_CFB = {
  week: "2026-10-20",
  away: "Ole Miss",
  home: "Texas",
  awayRank: 7,
  homeRank: 19,
  awayRecord: "5-1",
  homeRecord: "4-2",
} as const;

export function publishedFootballMatchup(
  sport: FootballSpotlightKind,
  item: PublishedFootballSport,
): FootballMatchupBreakdown {
  const away = item.game.away_team;
  const home = item.game.home_team;
  const proof = item.breakdown;
  const season = Number(item.week_of.slice(0, 4));
  const game = item.game;
  const verifiedOct20 = sport === "cfb"
    && item.week_of === VERIFIED_OCT20_CFB.week
    && normTeam(away) === normTeam(VERIFIED_OCT20_CFB.away)
    && normTeam(home) === normTeam(VERIFIED_OCT20_CFB.home);
  const awayRank = game.away_rank === undefined
    ? (verifiedOct20 ? VERIFIED_OCT20_CFB.awayRank : undefined) : game.away_rank;
  const homeRank = game.home_rank === undefined
    ? (verifiedOct20 ? VERIFIED_OCT20_CFB.homeRank : undefined) : game.home_rank;
  const awayRecord = game.away_record ?? (verifiedOct20 ? VERIFIED_OCT20_CFB.awayRecord : undefined);
  const homeRecord = game.home_record ?? (verifiedOct20 ? VERIFIED_OCT20_CFB.homeRecord : undefined);
  const rankSource = sport === "cfb" && (awayRank != null || homeRank != null)
    ? game.ranking_source ?? (verifiedOct20 ? "AP" : undefined)
    : undefined;
  return {
    id: "weekly-" + item.week_of + "-" + sport,
    title: away + " at " + home,
    venue: "",
    kickoffAt: item.game.kickoff_at,
    headerAssetPath: item.game.header_asset_path,
    teams: [
      {
        name: away, aliases: [away], rank: awayRank, record: awayRecord,
        sportsReferenceUrl: footballTeamSportsReferenceUrl(away, sport === "cfb" ? "CFB" : "NFL", season) ?? undefined,
      },
      {
        name: home, aliases: [home], rank: homeRank, record: homeRecord,
        sportsReferenceUrl: footballTeamSportsReferenceUrl(home, sport === "cfb" ? "CFB" : "NFL", season) ?? undefined,
      },
    ],
    // Both sports use the existing approved 3-things / bottom-line compact sheet.
    // Keep full researched six-section proof below for audit and other consumers.
    compact: {
      leagueLabel: sport === "cfb" ? "CFB" : "NFL",
      rankingSource: rankSource,
      setup: [{ text: proof.setup[0] ?? "" }],
      things: [
        { title: proof.things[0]!.title, body: [{ text: proof.things[0]!.body }] },
        { title: proof.things[1]!.title, body: [{ text: proof.things[1]!.body }] },
        { title: proof.things[2]!.title, body: [{ text: proof.things[2]!.body }] },
      ],
      bottomLine: [{ text: proof.paths_to_win.map((path) => path.team + ": " + path.body).join("  ·  ") }],
    },
    setup: proof.setup,
    keyMatchups: proof.things,
    pathsToWin: [proof.paths_to_win[0]!, proof.paths_to_win[1]!],
    playersToWatch: [proof.players_to_watch[0]!, proof.players_to_watch[1]!],
    unitEdges: [proof.unit_edges[0]!, proof.unit_edges[1]!],
  };
}

function normTeam(name: string): string {
  const token = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const exact = footballTeamSchoolMetadataFor(name);
  if (exact) return exact.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Picks commonly includes the school's mascot while the owner-selection
  // package stores the school's short name. Resolve the LONGEST known program
  // first (Texas Tech before Texas, Michigan State before Michigan).
  const expanded = footballTeamSchoolMetadata
    .filter((team) => {
      const root = team.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return token.length > root.length && token.startsWith(root);
    })
    .sort((a, b) => b.name.length - a.name.length)[0];
  return expanded ? expanded.name.toLowerCase().replace(/[^a-z0-9]/g, "") : token;
}

// Prefer a current, owner-approved weekly editorial only when the live Picks event
// actually contains the same matchup and kickoff date. Never display a stale game.
export function publishedFootballMatchupsForEvent(
  event: PickEvent | null,
  published: PublishedFootballWeek | null,
): FootballMatchupBreakdown[] {
  if (!event || event.sport !== "football" || !published) return [];
  const output: FootballMatchupBreakdown[] = [];
  for (const sport of ["cfb", "nfl"] as const) {
    const week = published[sport];
    if (!week) continue;
    const home = normTeam(week.game.home_team);
    const away = normTeam(week.game.away_team);
    const kickoff = Date.parse(week.game.kickoff_at);
    if (!Number.isFinite(kickoff)) continue;
    const matched = event.bouts.some((bout) => {
      const candidateHome = normTeam(bout.homeTeamSlug ?? bout.redFighterSlug);
      const candidateAway = normTeam(bout.awayTeamSlug ?? bout.blueFighterSlug);
      const names = [normTeam(bout.redFighterName), normTeam(bout.blueFighterName),
        normTeam(bout.homeTeamSlug ?? ""), normTeam(bout.awayTeamSlug ?? "")];
      const sameTeams = (candidateHome === home && candidateAway === away)
        || (names.includes(home) && names.includes(away));
      const boutStart = Date.parse(bout.locksAt ?? event.startsAt);
      return sameTeams && Number.isFinite(boutStart)
        && Math.abs(kickoff - boutStart) < 36 * 60 * 60 * 1000;
    });
    if (matched) output.push(publishedFootballMatchup(sport, week));
  }
  return output;
}

/** Keep the already-approved compact authored breakdown when a weekly
 * publication covers the exact same matchup. Carry its genuinely verified
 * weekly SeatGeek art across, rather than dropping either the compact
 * treatment or the real image. The current published week still controls
 * whether this match is eligible to be shown. */
export function mergeFootballWeeklyMatchupBreakdowns(
  weekly: FootballMatchupBreakdown[],
  authored: FootballMatchupBreakdown[],
): FootballMatchupBreakdown[] {
  function sameContest(a: FootballMatchupBreakdown, b: FootballMatchupBreakdown): boolean {
    const aKick = Date.parse(a.kickoffAt ?? "");
    const bKick = Date.parse(b.kickoffAt ?? "");
    return Number.isFinite(aKick) && Number.isFinite(bKick)
      && Math.abs(aKick - bKick) < 36 * 60 * 60 * 1000
      && a.teams.length === b.teams.length
      && a.teams.every((team) => b.teams.some((other) => normTeam(team.name) === normTeam(other.name)));
  }
  const used = new Set<number>();
  const results = weekly.map((published) => {
    const approved = authored.findIndex((candidate, index) =>
      !used.has(index) && Boolean(candidate.compact) && sameContest(published, candidate));
    if (approved < 0) return published;
    used.add(approved);
    return { ...authored[approved]!, headerAssetPath: published.headerAssetPath ?? authored[approved]!.headerAssetPath };
  });
  for (const [index, candidate] of authored.entries()) {
    if (!used.has(index) && !results.some((existing) => sameContest(existing, candidate))) {
      results.push(candidate);
    }
  }
  return results;
}

export function parsePublishedFootballWeek(raw: unknown): PublishedFootballWeek {
  return publishedSchema.parse(raw);
}

// The database alone decides exactly when an armed week becomes visible.
// A 15s refresh makes a page already open at midnight update without a reload.
export function usePublishedFootballWeek(): PublishedFootballWeek | null | undefined {
  const [client] = useState(() => getSupabaseClient());
  const [published, setPublished] = useState<PublishedFootballWeek | null | undefined>(() => client ? undefined : null);
  useEffect(() => {
    if (!client) { setPublished(null); return undefined; }
    let active = true;
    async function refresh() {
      const { data, error } = await client!.rpc("get_live_football_weekly_editorial");
      if (!active) return;
      if (error) { setPublished((previous) => previous ?? null); return; }
      try {
        const next = parsePublishedFootballWeek(data);
        if (active) setPublished(next);
      } catch {
        // Retain valid published data; resolve initial loading without displaying stale content.
        if (active) setPublished((previous) => previous ?? null);
      }
    }
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [client]);
  return published;
}
