import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const traitSchema = z.enum(["Arm", "Accuracy", "Processing", "Mobility"]);

const traitWinSchema = z.object({
  item_reference: z.string(),
  display_name: z.string(),
  team_code: z.string(),
  trait: traitSchema,
  price_paid: z.coerce.number().int().nonnegative(),
});

const playerSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  is_current_user: z.boolean(),
  bankroll: z.coerce.number().int().min(0).max(40),
  owned_count: z.coerce.number().int().min(0).max(4),
  traits: z.array(traitWinSchema).default([]),
});

const tableSchema = z.array(playerSchema);

export type FootballWeeklyBuildQbTablePlayer = z.infer<typeof playerSchema>;
export type FootballWeeklyBuildQbTableTrait = z.infer<typeof traitWinSchema>;

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

export interface FootballWeeklyBuildQbTableRepository {
  load(): Promise<FootballWeeklyBuildQbTablePlayer[]>;
}

export function createFootballWeeklyBuildQbTableRepository(
  suppliedClient?: Client | null,
): FootballWeeklyBuildQbTableRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async load() {
      const { data, error } = await client.rpc("get_football_weekly_build_qb_table");
      if (error) throw new Error(error.message || "Build a QB table could not be synced.");
      return tableSchema.parse(data);
    },
  };
}
