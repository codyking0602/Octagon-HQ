import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const teamSchema = z.object({
  slot: z.coerce.number().int().min(1).max(3),
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  lock_at: z.string(),
});

const bidHistorySchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  amount: z.coerce.number().int().min(0),
});

const priorResultSchema = z.object({
  slot: z.coerce.number().int().min(1).max(3),
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
  bids: z.array(bidHistorySchema).default([]),
});

const collectionSchema = z.object({
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  winning_bid: z.coerce.number().int().min(0),
});

const finalStandingSchema = z.object({
  rank: z.coerce.number().int().positive().nullable(),
  profile_id: z.string().uuid(),
  display_name: z.string(),
  final_score: z.coerce.number().nullable(),
  scoring_cost: z.coerce.number().int().nullable(),
  owned_count: z.coerce.number().int().nonnegative(),
  is_winner: z.boolean(),
  is_current_user: z.boolean(),
});

const finalCollectionSchema = z.object({
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  counts: z.boolean(),
});

const finalTeamSchema = z.object({
  day_index: z.coerce.number().int().min(1).max(7),
  slot: z.coerce.number().int().min(1).max(3),
  theme: z.string(),
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
});

const myResultSchema = z.object({
  week_start: z.string().optional(),
  profile_id: z.string().uuid().optional(),
  owned_count: z.coerce.number().int().nonnegative().optional(),
  final_score: z.coerce.number().nullable().optional(),
  scoring_cost: z.coerce.number().int().nullable().optional(),
  scoring_refs: z.array(z.string()).optional(),
  final_rank: z.coerce.number().int().positive().nullable().optional(),
  is_winner: z.boolean().optional(),
}).passthrough();

const finalSchema = z.object({
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(finalCollectionSchema),
  all_teams: z.array(finalTeamSchema),
  my_result: myResultSchema.default({}),
});

const availableSchema = z.object({
  available: z.literal(true),
  week_start: z.string(),
  week_end: z.string(),
  day_index: z.coerce.number().int().min(1).max(7),
  theme: z.string(),
  bankroll: z.coerce.number().int().min(0).max(40),
  owned_count: z.coerce.number().int().nonnegative(),
  reserve_floor: z.coerce.number().int().min(0).max(2),
  max_commit: z.coerce.number().int().min(0).max(40),
  submitted_today: z.boolean(),
  show_intro: z.boolean(),
  teams: z.array(teamSchema).length(3),
  bids: z.record(z.string(), z.coerce.number().int().min(0)).default({}),
  prior_results: z.array(priorResultSchema).default([]),
  collection: z.array(collectionSchema).default([]),
  previous_final: finalSchema.nullable().optional(),
});

const unavailableSchema = z.object({
  available: z.literal(false),
  starts_on: z.string().optional(),
});

const stateSchema = z.discriminatedUnion("available", [availableSchema, unavailableSchema]);

export type FootballWeeklyAuctionState = z.infer<typeof stateSchema>;
export type FootballWeeklyAuctionActiveState = z.infer<typeof availableSchema>;
export type FootballWeeklyAuctionFinal = z.infer<typeof finalSchema>;
export type FootballWeeklyAuctionTeam = z.infer<typeof teamSchema>;
export type FootballWeeklyAuctionPriorResult = z.infer<typeof priorResultSchema>;

type RpcError = { message?: string };
type Client = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: RpcError | null }>;
};

export class FootballWeeklyAuctionRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FootballWeeklyAuctionRepositoryError";
  }
}

async function rpc(client: Client, name: string, args?: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) {
    throw new FootballWeeklyAuctionRepositoryError(
      error.message || "Weekly Auction could not be synced.",
    );
  }
  return data;
}

export interface FootballWeeklyAuctionRepository {
  load(): Promise<FootballWeeklyAuctionState>;
  submit(bids: Record<1 | 2 | 3, number>): Promise<FootballWeeklyAuctionState>;
  acknowledgeFinal(weekStart: string): Promise<FootballWeeklyAuctionState>;
}

export function createFootballWeeklyAuctionRepository(
  suppliedClient?: Client | null,
): FootballWeeklyAuctionRepository | null {
  const client = suppliedClient === undefined
    ? getSupabaseClient() as unknown as Client | null
    : suppliedClient;
  if (!client) return null;

  return {
    async load() {
      return stateSchema.parse(await rpc(client, "get_my_football_weekly_auction"));
    },
    async submit(bids) {
      return stateSchema.parse(await rpc(client, "submit_my_football_weekly_auction_bids", {
        p_bids: {
          "1": bids[1],
          "2": bids[2],
          "3": bids[3],
        },
      }));
    },
    async acknowledgeFinal(weekStart) {
      return stateSchema.parse(await rpc(client, "acknowledge_my_football_weekly_auction_final", {
        p_week_start: weekStart,
      }));
    },
  };
}
