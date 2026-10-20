import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import { footballTeamSchoolMetadata, footballTeamSchoolMetadataFor } from "../back-room/footballTeamSchoolMetadata";
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

export function publishedFootballMatchup(
  sport: FootballSpotlightKind,
  item: PublishedFootballSport,
): FootballMatchupBreakdown {
  const away = item.game.away_team;
  const home = item.game.home_team;
  const proof = item.breakdown;
  return {
    id: "weekly-" + item.week_of + "-" + sport,
    title: away + " at " + home,
    venue: "",
    kickoffAt: item.game.kickoff_at,
    headerAssetPath: item.game.header_asset_path,
    teams: [{ name: away, aliases: [away] }, { name: home, aliases: [home] }],
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

export function parsePublishedFootballWeek(raw: unknown): PublishedFootballWeek {
  return publishedSchema.parse(raw);
}

// The database alone decides exactly when an armed week becomes visible.
// A 15s refresh makes a page already open at midnight update without a reload.
export function usePublishedFootballWeek(): PublishedFootballWeek | null | undefined {
  const [client] = useState(() => getSupabaseClient());
  const [published, setPublished] = useState<PublishedFootballWeek | null | undefined>(undefined);
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
