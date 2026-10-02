import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const bidHistorySchema = z.object({
  profile_id: z.string().uuid(),
  display_name: z.string(),
  amount: z.coerce.number().int().min(0),
  priority: z.coerce.number().int().min(1).max(12).nullable().optional(),
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

const superteamRosterSlotSchema = z.enum(["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"]);
const superteamGroupSchema = z.enum(["QB", "RB", "WR", "TE", "Front Seven", "Secondary", "Head Coach"]);
const superteamBidSchema = z.object({
  amount: z.coerce.number().int().min(0).max(50),
  priority: z.coerce.number().int().min(1).max(12),
});
const superteamCardSchema = z.object({
  slot: z.coerce.number().int().min(1).max(12),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  group_key: superteamGroupSchema,
  eligible_slots: z.array(superteamRosterSlotSchema),
  lock_at: z.string(),
});
const superteamPriorResultSchema = z.object({
  slot: z.coerce.number().int().min(1).max(12),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  group_key: superteamGroupSchema,
  winning_bid: z.coerce.number().int().min(0),
  roster_slot: superteamRosterSlotSchema.nullable(),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
  bids: z.array(bidHistorySchema.extend({
    priority: z.coerce.number().int().min(1).max(12).nullable(),
  })).default([]),
});
const superteamCollectionSchema = z.object({
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  group_key: superteamGroupSchema,
  roster_slot: superteamRosterSlotSchema,
  winning_bid: z.coerce.number().int().min(0),
});
const superteamFinalCollectionSchema = superteamCollectionSchema.extend({
  grade: z.coerce.number(),
  counts: z.boolean(),
});
const superteamFinalItemSchema = z.object({
  day_index: z.coerce.number().int().min(1).max(7),
  slot: z.coerce.number().int().min(1).max(12),
  item_reference: z.string(),
  display_name: z.string(),
  school: z.string(),
  season_year: z.coerce.number().int(),
  group_key: superteamGroupSchema,
  eligible_slots: z.array(superteamRosterSlotSchema),
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0),
  roster_slot: superteamRosterSlotSchema.nullable(),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
});
const superteamFinalSchema = z.object({
  subject_key: z.literal("cfb-superteam"),
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(superteamFinalCollectionSchema),
  all_teams: z.array(superteamFinalItemSchema),
  my_result: myResultSchema.default({}),
});

const nflTeamSeasonCardSchema = z.object({
  slot: z.coerce.number().int().min(1).max(7),
  item_reference: z.string(),
  team_name: z.string(),
  team_code: z.string(),
  season_year: z.coerce.number().int().min(2000).max(2025),
  display_label: z.string(),
  card_tag: z.string().nullable().optional(),
  lock_at: z.string(),
});

const nflTeamSeasonPriorResultSchema = z.object({
  slot: z.coerce.number().int().min(1).max(7),
  item_reference: z.string(),
  team_name: z.string(),
  team_code: z.string(),
  season_year: z.coerce.number().int().min(2000).max(2025),
  display_label: z.string(),
  winning_bid: z.coerce.number().int().min(0).max(50),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
  bids: z.array(bidHistorySchema).default([]),
});

const nflTeamSeasonCollectionSchema = z.object({
  item_reference: z.string(),
  team_name: z.string(),
  team_code: z.string(),
  season_year: z.coerce.number().int().min(2000).max(2025),
  display_label: z.string(),
  card_tag: z.string().nullable().optional(),
  winning_bid: z.coerce.number().int().min(0).max(50),
  source: z.enum(["normal", "wildcard", "autofill"]),
});

const nflWildcardTeamSchema = z.object({
  slot: z.coerce.number().int().min(1).max(4),
  item_reference: z.string(),
  season_year: z.coerce.number().int().min(2000).max(2025),
  primary_name: z.string(),
  team_code: z.string(),
  display_label: z.string(),
  source_url: z.string().nullable().optional(),
});

const nflWildcardStateSchema = z.object({
  available: z.literal(true),
  subject_key: z.literal("nfl-best-team-seasons-since-2000"),
  week_start: z.string(),
  day_index: z.coerce.number().int().min(1).max(8),
  teams: z.array(nflWildcardTeamSchema).length(4),
  submitted: z.boolean(),
  my_entries: z.coerce.number().int().min(0).max(5),
  my_rankings: z.array(z.string()).max(4),
  my_cut_item_reference: z.string().nullable().default(null),
  resolved: z.boolean(),
  priority_draws: z.array(z.object({
    draw_order: z.coerce.number().int().positive(),
    profile_id: z.string().uuid(),
    display_name: z.string(),
    entry_count: z.coerce.number().int().min(1).max(5),
  })).default([]),
  claims: z.array(z.object({
    profile_id: z.string().uuid(),
    display_name: z.string(),
    item_reference: z.string(),
    replaced_item_reference: z.string(),
    replaced_team_name: z.string().optional(),
    replaced_team_code: z.string().optional(),
    replaced_season_year: z.coerce.number().int().min(2000).max(2025).optional(),
    priority_order: z.coerce.number().int().positive(),
  })).default([]),
  reaping: z.object({
    profile_id: z.string().uuid(),
    display_name: z.string(),
    entry_count: z.coerce.number().int().min(1).max(5),
    next_week_start: z.string(),
    bankroll_delta: z.coerce.number().int(),
  }).nullable(),
  autofill: z.array(z.object({
    profile_id: z.string().uuid(),
    item_reference: z.string(),
    fill_order: z.coerce.number().int().positive(),
  })).default([]),
});

const nflTeamSeasonFinalCollectionSchema = nflTeamSeasonCollectionSchema.extend({
  grade: z.coerce.number(),
  counts: z.boolean(),
});

const nflTeamSeasonFinalTeamSchema = z.object({
  day_index: z.coerce.number().int().min(1).max(6),
  slot: z.coerce.number().int().min(1).max(7),
  item_reference: z.string(),
  team_name: z.string(),
  team_code: z.string(),
  season_year: z.coerce.number().int().min(2000).max(2025),
  display_label: z.string(),
  grade: z.coerce.number(),
  winning_bid: z.coerce.number().int().min(0).max(50),
  winner_profile_id: z.string().uuid().nullable(),
  winner_display_name: z.string().nullable(),
});

const nflTeamSeasonFinalSchema = z.object({
  subject_key: z.literal("nfl-best-team-seasons-since-2000"),
  week_start: z.string(),
  standings: z.array(finalStandingSchema),
  collection: z.array(nflTeamSeasonFinalCollectionSchema),
  all_teams: z.array(nflTeamSeasonFinalTeamSchema),
  wildcard: nflWildcardStateSchema,
  my_result: myResultSchema.default({}),
});

const finalSchema = z.union([cfbFinalSchema, buildQbFinalSchema, superteamFinalSchema, nflTeamSeasonFinalSchema]);

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
  previous_final: finalSchema.nullable().optional(),
} as const;

const cfbAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("cfb-best-teams-since-2000").default("cfb-best-teams-since-2000"),
  theme: z.string(),
  teams: z.array(cfbTeamSchema).length(3),
  prior_results: z.array(cfbPriorResultSchema).default([]),
  collection: z.array(cfbCollectionSchema).default([]),
  bids: z.record(z.string(), z.coerce.number().int().min(0)).default({}),
});

const buildQbAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("nfl-build-qb"),
  teams: z.array(buildQbCardSchema).length(4),
  trait_passes: z.record(z.string(), z.boolean()).default({}),
  prior_results: z.array(buildQbPriorResultSchema).default([]),
  collection: z.array(buildQbCollectionSchema).default([]),
  bids: z.record(z.string(), z.coerce.number().int().min(0)).default({}),
});

const superteamAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("cfb-superteam"),
  teams: z.array(superteamCardSchema).min(8).max(12),
  prior_results: z.array(superteamPriorResultSchema).default([]),
  collection: z.array(superteamCollectionSchema).default([]),
  tie_priority: z.array(z.object({
    profile_id: z.string().uuid(),
    display_name: z.string(),
    rank: z.coerce.number().int().positive(),
  })).default([]),
  bids: z.record(z.string(), superteamBidSchema).default({}),
});

const nflTeamSeasonBidSchema = z.union([
  superteamBidSchema,
  z.coerce.number().int().min(0).max(50),
]);
const nflTeamSeasonBidMapSchema = z.record(z.string(), nflTeamSeasonBidSchema);

const nflTeamSeasonAvailableSchema = z.object({
  ...commonActiveFields,
  subject_key: z.literal("nfl-best-team-seasons-since-2000"),
  starting_bankroll: z.coerce.number().int().min(0).max(50),
  theme: z.string(),
  teams: z.array(nflTeamSeasonCardSchema).max(7),
  prior_results: z.array(nflTeamSeasonPriorResultSchema).default([]),
  collection: z.array(nflTeamSeasonCollectionSchema).default([]),
  bids: nflTeamSeasonBidMapSchema.default({}),
  wildcard: nflWildcardStateSchema.nullable(),
});

const superteamLabSeatSchema = z.object({
  seat_index: z.coerce.number().int().min(1).max(6),
  profile_id: z.string().uuid(),
  display_name: z.string(),
  submitted_today: z.boolean(),
  owned_count: z.coerce.number().int().min(0).max(7),
  bankroll: z.coerce.number().int().min(0).max(50),
});

const superteamLabSchema = z.object({
  available: z.literal(true),
  run_number: z.coerce.number().int().positive(),
  lab_week_start: z.string(),
  day_index: z.coerce.number().int().min(1).max(8),
  completed: z.boolean(),
  submitted_count: z.coerce.number().int().min(0).max(6),
  seat_index: z.coerce.number().int().min(1).max(6),
  seats: z.array(superteamLabSeatSchema).length(6),
  state: superteamAvailableSchema.nullable(),
  final: superteamFinalSchema.nullable(),
});

const nflTeamSeasonLabSeatSchema = z.object({
  seat_index: z.coerce.number().int().min(1).max(5),
  profile_id: z.string().uuid(),
  display_name: z.string(),
  submitted_today: z.boolean(),
  owned_count: z.coerce.number().int().min(0).max(5),
  bankroll: z.coerce.number().int().min(0).max(50),
});

const nflTeamSeasonLabSchema = z.object({
  available: z.literal(true),
  run_number: z.coerce.number().int().positive(),
  lab_week_start: z.string(),
  day_index: z.coerce.number().int().min(1).max(8),
  completed: z.boolean(),
  submitted_count: z.coerce.number().int().min(0).max(5),
  seat_index: z.coerce.number().int().min(1).max(5),
  seats: z.array(nflTeamSeasonLabSeatSchema).length(5),
  state: nflTeamSeasonAvailableSchema.nullable(),
  final: nflTeamSeasonFinalSchema.nullable(),
});

const unavailableSchema = z.object({
  available: z.literal(false),
  subject_key: z.enum(["cfb-best-teams-since-2000", "nfl-build-qb", "cfb-superteam", "nfl-best-team-seasons-since-2000"]).optional(),
  starts_on: z.string().optional(),
  locked_this_week: z.boolean().optional(),
  week_start: z.string().optional(),
  eligible_week_start: z.string().optional(),
});

const stateSchema = z.union([cfbAvailableSchema, buildQbAvailableSchema, superteamAvailableSchema, nflTeamSeasonAvailableSchema, unavailableSchema]);

export type FootballWeeklyAuctionState = z.infer<typeof stateSchema>;
export type FootballWeeklyAuctionCfbState = z.infer<typeof cfbAvailableSchema>;
export type FootballWeeklyBuildQbState = z.infer<typeof buildQbAvailableSchema>;
export type FootballWeeklySuperteamState = z.infer<typeof superteamAvailableSchema>;
export type FootballWeeklyNflTeamSeasonState = z.infer<typeof nflTeamSeasonAvailableSchema>;
export type FootballWeeklyAuctionActiveState = FootballWeeklyAuctionCfbState | FootballWeeklyBuildQbState | FootballWeeklySuperteamState | FootballWeeklyNflTeamSeasonState;
export type FootballWeeklyAuctionFinal = z.infer<typeof cfbFinalSchema>;
export type FootballWeeklyBuildQbFinal = z.infer<typeof buildQbFinalSchema>;
export type FootballWeeklySuperteamFinal = z.infer<typeof superteamFinalSchema>;
export type FootballWeeklyNflTeamSeasonFinal = z.infer<typeof nflTeamSeasonFinalSchema>;
export type FootballWeeklyNflWildcardState = z.infer<typeof nflWildcardStateSchema>;
export type FootballWeeklyNflTeamSeasonCard = z.infer<typeof nflTeamSeasonCardSchema>;
export type FootballWeeklyNflTeamSeasonPriorResult = z.infer<typeof nflTeamSeasonPriorResultSchema>;
export type FootballWeeklyNflTeamSeasonLabState = z.infer<typeof nflTeamSeasonLabSchema>;
export type FootballWeeklyFinal = z.infer<typeof finalSchema>;
export type FootballWeeklyAuctionTeam = z.infer<typeof cfbTeamSchema>;
export type FootballWeeklyAuctionPriorResult = z.infer<typeof cfbPriorResultSchema>;
export type FootballWeeklyBuildQbCard = z.infer<typeof buildQbCardSchema>;
export type FootballWeeklyBuildQbPriorResult = z.infer<typeof buildQbPriorResultSchema>;
export type FootballWeeklyBuildQbTrait = z.infer<typeof buildQbTraitSchema>;
export type FootballWeeklySuperteamCard = z.infer<typeof superteamCardSchema>;
export type FootballWeeklySuperteamRosterSlot = z.infer<typeof superteamRosterSlotSchema>;
export type FootballWeeklySuperteamBid = z.infer<typeof superteamBidSchema>;
export type FootballWeeklySuperteamLabState = z.infer<typeof superteamLabSchema>;
export type FootballWeeklyAuctionBidInput = number | FootballWeeklySuperteamBid;

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

async function withNflTeamSeasonLabRankedBids(
  client: Client,
  lab: FootballWeeklyNflTeamSeasonLabState,
) {
  if (!lab.state || lab.day_index < 1 || lab.day_index > 6) return lab;
  const rankedBids = nflTeamSeasonBidMapSchema.parse(await rpc(
    client,
    "get_my_football_weekly_nfl_team_season_lab_ranked_bids",
    { p_seat_index: lab.seat_index },
  ));
  return {
    ...lab,
    state: {
      ...lab.state,
      bids: rankedBids,
    },
  };
}

export interface FootballWeeklyAuctionRepository {
  load(): Promise<FootballWeeklyAuctionState>;
  loadHistory(): Promise<FootballWeeklyFinal[]>;
  loadBuildQbPreview(): Promise<FootballWeeklyAuctionState>;
  loadSuperteamPreview(): Promise<FootballWeeklyAuctionState>;
  loadSuperteamLab(seatIndex?: number): Promise<FootballWeeklySuperteamLabState>;
  resetSuperteamLab(): Promise<FootballWeeklySuperteamLabState>;
  loadNflTeamSeasonLab(seatIndex?: number): Promise<FootballWeeklyNflTeamSeasonLabState>;
  resetNflTeamSeasonLab(): Promise<FootballWeeklyNflTeamSeasonLabState>;
  submitNflTeamSeasonLab(
    seatIndex: number,
    bids: Record<number, FootballWeeklyAuctionBidInput>,
  ): Promise<FootballWeeklyNflTeamSeasonLabState>;
  submitNflTeamSeasonLabWildcard(
    seatIndex: number,
    entries: number,
    rankings: string[],
    cutItemReference: string | null,
  ): Promise<FootballWeeklyNflTeamSeasonLabState>;
  advanceNflTeamSeasonLab(seatIndex?: number): Promise<FootballWeeklyNflTeamSeasonLabState>;
  jumpNflTeamSeasonLabToDay7(seatIndex?: number): Promise<FootballWeeklyNflTeamSeasonLabState>;
  submitNflTeamSeasonWildcard(
    entries: number,
    rankings: string[],
    cutItemReference: string | null,
  ): Promise<FootballWeeklyAuctionState>;
  submitSuperteamLab(
    seatIndex: number,
    bids: Record<number, FootballWeeklyAuctionBidInput>,
  ): Promise<FootballWeeklySuperteamLabState>;
  advanceSuperteamLab(seatIndex?: number): Promise<FootballWeeklySuperteamLabState>;
  submit(bids: Record<number, FootballWeeklyAuctionBidInput>): Promise<FootballWeeklyAuctionState>;
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
    async loadSuperteamLab(seatIndex = 1) {
      return superteamLabSchema.parse(await rpc(client, "get_my_football_weekly_superteam_lab", {
        p_seat_index: seatIndex,
      }));
    },
    async loadNflTeamSeasonLab(seatIndex = 1) {
      const lab = nflTeamSeasonLabSchema.parse(await rpc(client, "get_my_football_weekly_nfl_team_season_lab", {
        p_seat_index: seatIndex,
      }));
      return withNflTeamSeasonLabRankedBids(client, lab);
    },
    async resetNflTeamSeasonLab() {
      return nflTeamSeasonLabSchema.parse(await rpc(client, "reset_my_football_weekly_nfl_team_season_lab"));
    },
    async submitNflTeamSeasonLab(seatIndex, bids) {
      const payload: Record<string, FootballWeeklyAuctionBidInput> = {};
      for (const [slot, value] of Object.entries(bids)) payload[slot] = value;
      const lab = nflTeamSeasonLabSchema.parse(await rpc(client, "submit_my_football_weekly_nfl_team_season_lab_bids", {
        p_seat_index: seatIndex,
        p_bids: payload,
      }));
      return withNflTeamSeasonLabRankedBids(client, lab);
    },
    async submitNflTeamSeasonLabWildcard(seatIndex, entries, rankings, cutItemReference) {
      return nflTeamSeasonLabSchema.parse(await rpc(client, "submit_my_football_weekly_nfl_team_season_lab_wildcard_v2", {
        p_seat_index: seatIndex,
        p_entries: entries,
        p_rankings: rankings,
        p_cut_item_reference: cutItemReference,
      }));
    },
    async advanceNflTeamSeasonLab(seatIndex = 1) {
      return nflTeamSeasonLabSchema.parse(await rpc(client, "advance_my_football_weekly_nfl_team_season_lab", {
        p_seat_index: seatIndex,
      }));
    },
    async jumpNflTeamSeasonLabToDay7(seatIndex = 1) {
      return nflTeamSeasonLabSchema.parse(await rpc(client, "jump_my_football_weekly_nfl_team_season_lab_to_day7", {
        p_seat_index: seatIndex,
      }));
    },
    async submitNflTeamSeasonWildcard(entries, rankings, cutItemReference) {
      return stateSchema.parse(await rpc(client, "submit_my_football_weekly_nfl_team_season_wildcard_v2", {
        p_entries: entries,
        p_rankings: rankings,
        p_cut_item_reference: cutItemReference,
      }));
    },
    async resetSuperteamLab() {
      return superteamLabSchema.parse(await rpc(client, "reset_my_football_weekly_superteam_lab"));
    },
    async submitSuperteamLab(seatIndex, bids) {
      const payload: Record<string, FootballWeeklyAuctionBidInput> = {};
      for (const [slot, value] of Object.entries(bids)) payload[slot] = value;
      return superteamLabSchema.parse(await rpc(client, "submit_my_football_weekly_superteam_lab_bids", {
        p_seat_index: seatIndex,
        p_bids: payload,
      }));
    },
    async advanceSuperteamLab(seatIndex = 1) {
      return superteamLabSchema.parse(await rpc(client, "advance_my_football_weekly_superteam_lab", {
        p_seat_index: seatIndex,
      }));
    },
    async submit(bids) {
      const payload: Record<string, FootballWeeklyAuctionBidInput> = {};
      for (const [slot, value] of Object.entries(bids)) payload[slot] = value;
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
