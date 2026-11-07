import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const player = z.object({
  slot: z.enum(["PG", "SG", "SF", "PF", "C", "GUARD", "BIG"]),
  playerId: z.string().min(1),
  name: z.string().min(1),
  teamCode: z.string().min(1),
  nbaPlayerId: z.string().nullable(),
  developmentDelta: z.number().nullable().optional(),
});
const season = z.object({
  year: z.number().int().min(1).max(3),
  overall: z.number().int().min(0).max(100).nullable(),
  wins: z.number().int().min(0).max(82),
  losses: z.number().int().min(0).max(82),
  finish: z.string().min(1),
  titleOdds: z.number().min(0).max(100).nullable().optional(),
});
export const nbaGmChallengeRecapSchema = z.object({
  creator: z.object({
    score: z.number().min(0).max(100),
    rosterGrade: z.number().min(0).max(100),
    recordGrade: z.number().min(0).max(100),
    playoffGrade: z.number().min(0).max(100),
    weights: z.tuple([z.number(), z.number(), z.number()]),
    seasons: z.array(season).length(3),
    openingRoster: z.array(player).length(7),
    finalRoster: z.array(player).length(7),
  }),
  responder: z.object({
    score: z.number().min(0).max(100),
    rosterGrade: z.number().min(0).max(100),
    recordGrade: z.number().min(0).max(100),
    playoffGrade: z.number().min(0).max(100),
    weights: z.tuple([z.number(), z.number(), z.number()]),
    seasons: z.array(season).length(3),
    openingRoster: z.array(player).length(7),
    finalRoster: z.array(player).length(7),
  }),
});

export type NbaGmChallengeRecap = z.infer<typeof nbaGmChallengeRecapSchema>;
export type NbaGmChallengeSide = NbaGmChallengeRecap["creator"];
export type NbaGmChallengePlayer = NbaGmChallengeSide["finalRoster"][number];

export async function loadNbaGmChallengeRecap(code: string): Promise<NbaGmChallengeRecap | null> {
  const client = getSupabaseClient();
  if (!client) throw new Error("NBA GM comparison is temporarily unavailable.");
  const { data, error } = await client.rpc("nba_gm_challenge_recap", { p_code: code });
  if (error) throw new Error(error.message || "NBA GM comparison could not load.");
  return data == null ? null : nbaGmChallengeRecapSchema.parse(data);
}

export function nbaGmChallengeInsights(side: NbaGmChallengeSide) {
  const wins = side.seasons.reduce((total, year) => total + year.wins, 0);
  const losses = side.seasons.reduce((total, year) => total + year.losses, 0);
  const titles = side.seasons.filter(year => year.finish === "Champion").length;
  const openingIds = new Set(side.openingRoster.map(p => p.playerId));
  const acquired = side.finalRoster.filter(p => !openingIds.has(p.playerId));
  const outgoing = side.openingRoster.filter(p => !side.finalRoster.some(f => f.playerId === p.playerId));
  const biggestLeap = side.finalRoster
    .filter(p => p.developmentDelta != null && p.developmentDelta >= .85)
    .sort((a, b) => (b.developmentDelta ?? 0) - (a.developmentDelta ?? 0))[0] ?? null;
  return { wins, losses, titles, acquired, outgoing, biggestLeap, retained: 7 - acquired.length };
}

export function nbaGmDevelopmentLabel(delta: number | null | undefined) {
  if (delta == null) return "UNRECORDED";
  if (delta >= 3) return "BREAKOUT";
  if (delta >= .85) return "IMPROVED";
  if (delta <= -2.5) return "MAJOR REGRESSION";
  if (delta <= -.85) return "REGRESSED";
  return "HELD STEADY";
}
