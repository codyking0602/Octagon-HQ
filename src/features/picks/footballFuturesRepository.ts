import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { FootballFuturesPicks } from "./footballPicksScoring";

const futuresPicksSchema = z.object({
  cfbPower4Champions: z.array(z.string()),
  cfbPlayoffTeams: z.array(z.string()),
  cfbSemifinalists: z.array(z.string()),
  cfbHeisman: z.string(),
  cfbNationalChampion: z.string(),
  nflDivisionChampions: z.array(z.string()),
  nflPlayoffTeams: z.array(z.string()),
  nflConferenceChampionshipTeams: z.array(z.string()),
  nflMvp: z.string(),
  nflSuperBowlChampion: z.string(),
});

const groupEntrySchema = z.object({
  profile_id: z.string(),
  display_name: z.string(),
  picks: futuresPicksSchema,
});

const snapshotSchema = z.object({
  season: z.number().int(),
  locked: z.boolean(),
  lock_at: z.string(),
  own_picks: futuresPicksSchema.nullable(),
  group_picks: z.array(groupEntrySchema),
});

export interface FootballFuturesGroupEntry {
  profileId: string;
  displayName: string;
  picks: FootballFuturesPicks;
}

export interface FootballFuturesSnapshot {
  season: number;
  locked: boolean;
  lockAt: string;
  ownPicks: FootballFuturesPicks | null;
  groupPicks: FootballFuturesGroupEntry[];
}

function mapSnapshot(value: unknown): FootballFuturesSnapshot {
  const parsed = snapshotSchema.parse(value);
  return {
    season: parsed.season,
    locked: parsed.locked,
    lockAt: parsed.lock_at,
    ownPicks: parsed.own_picks,
    groupPicks: parsed.group_picks.map((entry) => ({
      profileId: entry.profile_id,
      displayName: entry.display_name,
      picks: entry.picks,
    })),
  };
}

async function rpc(name: string, params?: Record<string, unknown>) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Football Futures are not connected on this build.");
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new Error(error.message || "Football Futures are unavailable.");
  return data;
}

export async function loadFootballFutures(): Promise<FootballFuturesSnapshot> {
  return mapSnapshot(await rpc("get_football_futures"));
}

export async function saveFootballFutures(picks: FootballFuturesPicks): Promise<FootballFuturesSnapshot> {
  return mapSnapshot(await rpc("save_football_futures", { p_picks: picks }));
}
