import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { NbaGmDevPlayer, NbaGmDevRun } from "./nbaGmDevModel";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";

const slot = z.enum(NBA_GM_ROSTER_SLOTS);
const run = z.object({
  version: z.literal("nba-gm-dev-v1"),
  seed: z.string().startsWith("nba-gm-"),
  phase: z.enum(["draft", "review", "final"]),
  picks: z.array(z.object({ slot, playerId: z.string().min(1) })).max(7),
  pendingTeam: z.string().nullable(),
  pendingSlot: slot.nullable(),
  spinIndex: z.number().int().nonnegative(),
  caps: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
  results: z.array(z.object({
    season: z.number().int(), wins: z.number().int(), losses: z.number().int(),
    offense: z.number(), defense: z.number(), positionalFit: z.number(), finish: z.string(),
  })),
});
const player = z.object({
  id: z.string().min(1), name: z.string().min(1),
  teamCode: z.string(), positions: z.array(z.enum(["PG","SG","SF","PF","C"])).min(1),
  currentGrade: z.number().int(),
  salaries: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
  skills: z.object({
    scoring: z.number().int(), shooting: z.number().int(), playmaking: z.number().int(),
    perimeterDefense: z.number().int(), interiorDefense: z.number().int(), rebounding: z.number().int(),
  }),
  pricingKind: z.literal("GAME_FIXTURE_NOT_REAL_CONTRACT"),
  eligibilityKind: z.literal("PROVISIONAL_EDITORIAL"),
});
type RpcClient = { rpc: (name: string, args?: Record<string, unknown>) =>
  PromiseLike<{ data: unknown; error: { message?: string } | null }> };

export function createNbaGmDevRepository(supplied?: RpcClient | null) {
  const client = supplied === undefined ? getSupabaseClient() as unknown as RpcClient | null : supplied;
  if (!client) return null;
  return {
    async catalog(): Promise<NbaGmDevPlayer[]> {
      const { data, error } = await client.rpc("nba_gm_dev_catalog");
      if (error) throw new Error(error.message || "NBA GM private catalog unavailable.");
      return z.array(player).length(330).parse(data) as NbaGmDevPlayer[];
    },
    async action(
      operation: "load" | "start" | "spin" | "pick" | "confirm",
      slotValue?: string,
      playerId?: string,
    ): Promise<NbaGmDevRun | null> {
      const { data, error } = await client.rpc("nba_gm_dev_action", {
        p_action: operation,
        p_slot: slotValue ?? null,
        p_player_id: playerId ?? null,
      });
      if (error) throw new Error(error.message || "NBA GM action failed.");
      return data == null ? null : run.parse(data) as NbaGmDevRun;
    },
  };
}
