import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export const SPORT_CHAMPIONSHIP_PLACEMENTS = [100, 92, 85, 79, 74, 70] as const;
export const SPORT_CHAMPIONSHIP_WEIGHTS = { picks: 60, daily: 30, featured: 10 } as const;

const entrySchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  initials: z.string(),
  is_current_user: z.boolean(),
  rank: z.number().int().positive(),
  rating: z.number().nullable(),
  picks_rating: z.number(),
  daily_rating: z.number(),
  featured_rating: z.number(),
  picks_rank: z.number().int().positive(),
  daily_rank: z.number().int().positive(),
  featured_rank: z.number().int().positive(),
  picks_played: z.number().int().nonnegative(),
  daily_played: z.number().int().nonnegative(),
  featured_played: z.number().int().nonnegative(),
});
const weightsSchema = z.object({
  picks: z.number().int().nonnegative(),
  daily: z.number().int().nonnegative(),
  featured: z.number().int().nonnegative(),
});
const countsSchema = z.object({
  picks: z.number().int().nonnegative(),
  daily: z.number().int().nonnegative(),
  featured: z.number().int().nonnegative(),
});
const championshipSchema = z.object({
  sport: z.enum(["football", "ufc"]),
  season: z.number().int(),
  field_size: z.number().int().nonnegative(),
  weights: weightsSchema,
  event_counts: countsSchema,
  entries: z.array(entrySchema),
  own: entrySchema.nullable(),
});
export type SportChampionshipEntry = z.infer<typeof entrySchema>;
export type SportChampionship = z.infer<typeof championshipSchema>;
export type SportChampionshipSport = SportChampionship["sport"];

export function parseSportChampionship(raw: unknown): SportChampionship {
  return championshipSchema.parse(raw);
}

type ChampionshipClient = {
  rpc: (name: string, params: Record<string, unknown>) =>
    PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

export async function loadSportChampionship(
  sport: SportChampionshipSport,
  season = 2026,
  suppliedClient?: ChampionshipClient | null,
): Promise<SportChampionship> {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as ChampionshipClient | null
    : suppliedClient;
  if (!client) throw new Error("Championship standings are not connected.");
  const { data, error } = await client.rpc("get_sport_championship", {
    p_sport: sport,
    p_season: season,
  });
  if (error) throw new Error(error.message || "Championship standings could not load.");
  return parseSportChampionship(data);
}
