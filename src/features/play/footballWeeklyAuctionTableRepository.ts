import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const auctionTableTeamSchema = z.object({
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  price_paid: z.coerce.number().int().nonnegative(),
});

const auctionTablePlayerSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  is_current_user: z.boolean(),
  bankroll: z.coerce.number().int().min(0).max(40),
  owned_count: z.coerce.number().int().nonnegative(),
  teams: z.array(auctionTableTeamSchema).default([]),
});

const auctionTableSchema = z.array(auctionTablePlayerSchema);

export type FootballWeeklyAuctionTablePlayer = z.infer<typeof auctionTablePlayerSchema>;
export type FootballWeeklyAuctionTableTeam = z.infer<typeof auctionTableTeamSchema>;

export class FootballWeeklyAuctionTableRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FootballWeeklyAuctionTableRepositoryError";
  }
}

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

export interface FootballWeeklyAuctionTableRepository {
  load(): Promise<FootballWeeklyAuctionTablePlayer[]>;
}

export function createFootballWeeklyAuctionTableRepository(
  suppliedClient?: Client | null,
): FootballWeeklyAuctionTableRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async load() {
      const { data, error } = await client.rpc("get_football_weekly_auction_table");
      if (error) {
        throw new FootballWeeklyAuctionTableRepositoryError(
          error.message || "Auction Table could not be synced.",
        );
      }
      return auctionTableSchema.parse(data);
    },
  };
}
