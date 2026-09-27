import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const bidHistorySchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  amount: z.coerce.number().int().min(0),
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

const cfbTeamSchema = z.object({
  slot: z.coerce.number().int().min(1).max(3),
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  lock_at: z.string(),
});

const cfbPriorResultSchema = z.object({
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

const cfbCollectionSchema = z.object({
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  winning_bid: z.coerce.number().int().min(0),
});

const cfbFinalCollectionSchema = z.object({
  season_reference: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  display_label: z.string(),
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  counts: z.boolean(),
});

const cfbFinalTeamSchema = z.object({
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

const cfbFinalSchema = z.object({
  subject_key: z.literal("cfb-best-teams-since-2000").default("cfb-best-teams-since-2000"),
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(cfbFinalCollectionSchema),
  all_teams: z.array(cfbFinalTeamSchema),
  my_result: myResultSchema.default({}),
});

const buildQbTraitSchema = z.enum(["Arm", "Accuracy", "Processing", "Mobility"]);

const buildQbCardSchema = z.object({
  slot: z.coerce.number().int().min(1).max(4),
  item_reference: z.string(),
  display_name: z.string(),
  team_code: z.string(),
  trait: buildQbTraitSchema,
  lock_at: z.string(),
});

const buildQbPriorResultSchema = z.object({
  slot: z.coerce.number().int().min(1).max(4),
  item_reference: z.string(),
  display_name: z.string(),
  team_code: z.string(),
  trait: buildQbTraitSchema,
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
  bids: z.array(bidHistorySchema).default([]),
});

const buildQbCollectionSchema = z.object({
  item_reference: z.string(),
  display_name: z.string(),
  team_code: z.string(),
  trait: buildQbTraitSchema,
  winning_bid: z.coerce.number().int().min(0),
});

const buildQbFinalCollectionSchema = buildQbCollectionSchema.extend({
  grade: z.coerce.number(),
  counts: z.boolean(),
});

const buildQbFinalTeamSchema = z.object({
  day_index: z.coerce.number().int().min(1).max(7),
  slot: z.coerce.number().int().min(1).max(4),
  item_reference: z.string(),
  display_name: z.string(),
  team_code: z.string(),
  trait: buildQbTraitSchema,
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
});

const buildQbFinalSchema = z.object({
  subject_key: z.literal("nfl-build-qb"),
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(buildQbFinalCollectionSchema),
  all_teams: z.array(buildQbFinalTeamSchema),
  my_result: myResultSchema.default({}),
});

const superteamCandidateGroupSchema = z.enum([
  "QB", "RB", "WR", "TE", "Front Seven", "Secondary", "Head Coach",
]);
const superteamRosterSlotSchema = z.enum([
  "QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach",
]);

const superteamCardSchema = z.object({
  slot: z.coerce.number().int().min(1).max(8),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  candidate_group: superteamCandidateGroupSchema,
  lock_at: z.string(),
});

const superteamClaimSchema = z.object({
  amount: z.coerce.number().int().min(0).max(50),
  roster_slot: superteamRosterSlotSchema,
  priority: z.coerce.number().int().min(1).max(8),
});

const superteamPriorBidSchema = bidHistorySchema.extend({
  priority: z.coerce.number().int().min(1).max(8).nullable().optional(),
  roster_slot: superteamRosterSlotSchema.nullable().optional(),
});

const superteamPriorResultSchema = z.object({
  slot: z.coerce.number().int().min(1).max(8),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  candidate_group: superteamCandidateGroupSchema,
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
  roster_slot: superteamRosterSlotSchema.nullable().optional(),
  bids: z.array(superteamPriorBidSchema).default([]),
});

const superteamRosterSchema = z.object({
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  candidate_group: superteamCandidateGroupSchema,
  roster_slot: superteamRosterSlotSchema,
  price_paid: z.coerce.number().int().min(0).max(50),
  source: z.enum(["auction", "autofill"]),
});

const superteamFinalRosterSchema = superteamRosterSchema.extend({
  grade: z.coerce.number(),
});

const superteamAllRosterSchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  item_reference: z.string(),
  player_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  candidate_group: superteamCandidateGroupSchema,
  roster_slot: superteamRosterSlotSchema,
  grade: z.coerce.number(),
  price_paid: z.coerce.number().int().min(0).max(50),
  source: z.enum(["auction", "autofill"]),
});

const superteamFinalTeamSchema = z.object({
  day_index: z.coerce.number().int().min(1).max(7),
  slot: z.coerce.number().int().min(1).max(8),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  candidate_group: superteamCandidateGroupSchema,
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
});

const superteamFinalSchema = z.object({
  subject_key: z.literal("cfb-superteam"),
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(superteamFinalRosterSchema),
  all_rosters: z.array(superteamAllRosterSchema).default([]),
  all_teams: z.array(superteamFinalTeamSchema),
  my_result: myResultSchema.default({}),
});

const finalSchema = z.union([cfbFinalSchema, buildQbFinalSchema, superteamFinalSchema]);

const commonActiveFields = {
  available: z.literal(true),
  week_start: z.string(),
  week_end: z.string(),
  day_index: z.coerce.number().int().min(1).max(7),
  bankroll: z.coerce.number().int().min(0).max(50),
  owned_count: z.coerce.number().int().nonnegative(),
  reserve_floor: z.coerce.number().int().min(0).max(7),
  max_commit: z.coerce.number().int().min(0).max(50),
  submitted_today: z.boolean(),
  show_intro: z.boolean(),
  bids: z.record(z.string(), z.coerce.number().int().min(0)).default({}),
  previous_final: finalSchema.nullable().optional(),
} as const;

const cfbAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("cfb-best-teams-since-2000").default("cfb-best-teams-since-2000"),
  theme: z.string(),
  teams: z.array(cfbTeamSchema).length(3),
  prior_results: z.array(cfbPriorResultSchema).default([]),
  collection: z.array(cfbCollectionSchema).default([]),
});

const buildQbAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("nfl-build-qb"),
  teams: z.array(buildQbCardSchema).length(4),
  trait_passes: z.record(z.string(), z.boolean()).default({}),
  prior_results: z.array(buildQbPriorResultSchema).default([]),
  collection: z.array(buildQbCollectionSchema).default([]),
});

const superteamAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("cfb-superteam"),
  teams: z.array(superteamCardSchema).length(8),
  claims: z.record(z.string(), superteamClaimSchema).default({}),
  prior_results: z.array(superteamPriorResultSchema).default([]),
  roster: z.array(superteamRosterSchema).default([]),
});

const unavailableSchema = z.object({
  available: z.literal(false),
  subject_key: z.enum(["cfb-best-teams-since-2000", "nfl-build-qb", "cfb-superteam"]).optional(),
  starts_on: z.string().optional(),
  locked_this_week: z.boolean().optional(),
  week_start: z.string().optional(),
  eligible_week_start: z.string().optional(),
});

const stateSchema = z.union([
  cfbAvailableSchema,
  buildQbAvailableSchema,
  superteamAvailableSchema,
  unavailableSchema,
]);

export type FootballWeeklyAuctionState = z.infer<typeof stateSchema>;
export type FootballWeeklyAuctionCfbState = z.infer<typeof cfbAvailableSchema>;
export type FootballWeeklyBuildQbState = z.infer<typeof buildQbAvailableSchema>;
export type FootballWeeklySuperteamState = z.infer<typeof superteamAvailableSchema>;
export type FootballWeeklyAuctionActiveState =
  | FootballWeeklyAuctionCfbState
  | FootballWeeklyBuildQbState
  | FootballWeeklySuperteamState;
export type FootballWeeklyAuctionFinal = z.infer<typeof cfbFinalSchema>;
export type FootballWeeklyBuildQbFinal = z.infer<typeof buildQbFinalSchema>;
export type FootballWeeklySuperteamFinal = z.infer<typeof superteamFinalSchema>;
export type FootballWeeklyFinal = z.infer<typeof finalSchema>;
export type FootballWeeklyAuctionTeam = z.infer<typeof cfbTeamSchema>;
export type FootballWeeklyAuctionPriorResult = z.infer<typeof cfbPriorResultSchema>;
export type FootballWeeklyBuildQbCard = z.infer<typeof buildQbCardSchema>;
export type FootballWeeklyBuildQbPriorResult = z.infer<typeof buildQbPriorResultSchema>;
export type FootballWeeklyBuildQbTrait = z.infer<typeof buildQbTraitSchema>;
export type FootballWeeklySuperteamCard = z.infer<typeof superteamCardSchema>;
export type FootballWeeklySuperteamRosterSlot = z.infer<typeof superteamRosterSlotSchema>;
export type FootballWeeklySuperteamCandidateGroup = z.infer<typeof superteamCandidateGroupSchema>;
export type FootballWeeklySuperteamClaim = z.infer<typeof superteamClaimSchema>;

export type FootballWeeklySuperteamBidPayload = {
  amount: number;
  roster_slot: FootballWeeklySuperteamRosterSlot;
  priority: number;
};
export type FootballWeeklyAuctionBidPayload =
  Record<number, number | FootballWeeklySuperteamBidPayload>;

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
  loadHistory(): Promise<FootballWeeklyFinal[]>;
  loadBuildQbPreview(): Promise<FootballWeeklyAuctionState>;
  loadSuperteamPreview(): Promise<FootballWeeklyAuctionState>;
  submit(bids: FootballWeeklyAuctionBidPayload): Promise<FootballWeeklyAuctionState>;
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
    async loadHistory() {
      return z.array(finalSchema).parse(await rpc(client, "get_my_football_weekly_auction_history"));
    },
    async loadBuildQbPreview() {
      return stateSchema.parse(await rpc(client, "get_my_football_weekly_build_qb_preview"));
    },
    async loadSuperteamPreview() {
      return stateSchema.parse(await rpc(client, "get_my_football_weekly_superteam_preview"));
    },
    async submit(bids) {
      const payload: Record<string, number | FootballWeeklySuperteamBidPayload> = {};
      for (const [slot, bid] of Object.entries(bids)) payload[slot] = bid;
      return stateSchema.parse(await rpc(client, "submit_my_football_weekly_auction_bids", {
        p_bids: payload,
      }));
    },
    async acknowledgeFinal(weekStart) {
      return stateSchema.parse(await rpc(client, "acknowledge_my_football_weekly_auction_final", {
        p_week_start: weekStart,
      }));
    },
  };
}
