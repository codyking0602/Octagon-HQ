
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const playResult = z.object({
  slot: z.number().int().positive(),
  challenge_key: z.string(),
  title: z.string(),
  date: z.string(),
  game_type: z.string(),
  profile_id: z.string(),
  raw_score: z.number(),
  rank: z.number().int().positive(),
  points: z.number(),
});
const seriesPick = z.object({
  profile_id: z.string(),
  series_id: z.string(),
  winner_team_id: z.string(),
});
const seasonRecap = z.object({
  season: z.number().int(),
  play_results: z.array(playResult),
  series_picks: z.array(seriesPick),
});
export type MlbRecapPlayResult = z.infer<typeof playResult>;
export type MlbRecapSeriesPick = z.infer<typeof seriesPick>;
export type MlbSeasonRecap = { season: number; playResults: MlbRecapPlayResult[]; seriesPicks: MlbRecapSeriesPick[] };
export async function loadMlbSeasonRecap(season: number): Promise<MlbSeasonRecap> {
  const client = getSupabaseClient();
  if (!client) throw new Error("MLB results are not connected.");
  const { data, error } = await client.rpc("get_mlb_postseason_season_recap", { p_season: season });
  if (error) throw new Error(error.message || "MLB recap is unavailable.");
  const parsed = seasonRecap.parse(data);
  if (parsed.season !== season) throw new Error("Unexpected MLB recap season.");
  return { season: parsed.season, playResults: parsed.play_results, seriesPicks: parsed.series_picks };
}
