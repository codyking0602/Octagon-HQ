import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export const MLB_CHAMPIONSHIP_SCORING = {
  totalMax: 100,
  seriesMax: 43,
  bracketMax: 32,
  playMax: 25,
  seriesRound: {
    wild_card: 2,
    division_series: 4,
    championship_series: 5,
    world_series: 9,
  },
  bracketRound: {
    wild_card: 1,
    division_series: 2,
    championship_series: 5,
    world_series: 10,
  },
  playPlacement: [2.5, 2, 1.5, 1, 0.5, 0],
} as const;

const championshipEntrySchema = z.object({
  profile_id: z.string(),
  display_name: z.string(),
  is_current_user: z.boolean(),
  overall_rank: z.number().int().positive(),
  total_points: z.number(),
  series_points: z.number(),
  series_rank: z.number().int().positive(),
  bracket_points: z.number(),
  bracket_rank: z.number().int().positive(),
  play_points: z.number(),
  play_rank: z.number().int().positive(),
});

const championshipSchema = z.object({
  season: z.number().int(),
  total_max: z.number(),
  series_max: z.number(),
  bracket_max: z.number(),
  play_max: z.number(),
  own: championshipEntrySchema.nullable(),
  standings: z.array(championshipEntrySchema),
});

export type MlbChampionshipEntry = z.infer<typeof championshipEntrySchema>;

export type MlbChampionship = {
  season: number;
  totalMax: number;
  seriesMax: number;
  bracketMax: number;
  playMax: number;
  own: MlbChampionshipEntry | null;
  standings: MlbChampionshipEntry[];
};

export function mapMlbChampionship(value: unknown): MlbChampionship {
  const parsed = championshipSchema.parse(value);
  return {
    season: parsed.season,
    totalMax: parsed.total_max,
    seriesMax: parsed.series_max,
    bracketMax: parsed.bracket_max,
    playMax: parsed.play_max,
    own: parsed.own,
    standings: parsed.standings,
  };
}

export async function loadMlbChampionship(season: number) {
  const client = getSupabaseClient();
  if (!client) throw new Error("MLB Championship is not connected on this build.");
  const { data, error } = await client.rpc("get_mlb_postseason_championship", { p_season: season });
  if (error) throw new Error(error.message || "MLB Championship could not load.");
  return mapMlbChampionship(data);
}

export function formatChampionshipPoints(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
