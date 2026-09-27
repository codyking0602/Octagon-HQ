import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const rosterSlotSchema = z.enum(["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"]);

const rosterItemSchema = z.object({
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  group_key: z.string(),
  roster_slot: rosterSlotSchema,
  price_paid: z.coerce.number().int().nonnegative(),
});

const playerSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  is_current_user: z.boolean(),
  bankroll: z.coerce.number().int().min(0).max(50),
  owned_count: z.coerce.number().int().min(0).max(7),
  roster: z.array(rosterItemSchema).default([]),
});

const tableSchema = z.array(playerSchema);

export type FootballWeeklySuperteamTablePlayer = z.infer<typeof playerSchema>;
export type FootballWeeklySuperteamTableRosterItem = z.infer<typeof rosterItemSchema>;
export type FootballWeeklySuperteamTableMode = "live" | "lab";

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

export interface FootballWeeklySuperteamTableRepository {
  load(mode?: FootballWeeklySuperteamTableMode, seatIndex?: number): Promise<FootballWeeklySuperteamTablePlayer[]>;
}

export function createFootballWeeklySuperteamTableRepository(
  suppliedClient?: Client | null,
): FootballWeeklySuperteamTableRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async load(mode = "live", seatIndex = 1) {
      const name = mode === "lab"
        ? "get_my_football_weekly_superteam_lab_table"
        : "get_football_weekly_superteam_table";
      const args = mode === "lab" ? { p_seat_index: seatIndex } : undefined;
      const { data, error } = await client.rpc(name, args);
      if (error) throw new Error(error.message || "CFB Superteam Auction Table could not be synced.");
      return tableSchema.parse(data);
    },
  };
}
