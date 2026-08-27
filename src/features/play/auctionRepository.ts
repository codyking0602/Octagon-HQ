import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import {
  ULTIMATE_FIGHTER_CATEGORIES,
  auctionModeDefinition,
  isAuctionModeId,
  type AuctionModeId,
  type UltimateFighterCategory,
} from "./auctionContract";

const uuid = z.string().uuid();
const lifecycleSchema = z.enum(["prepared", "sent", "active", "completed", "declined", "cancelled"]);
const categorySchema = z.enum(ULTIMATE_FIGHTER_CATEGORIES);
const itemSchema = z.object({
  deck_position: z.number().int().positive(),
  item_reference: z.string().min(1).nullable().optional(),
  display_label: z.string().min(1),
}).strict();
const awardSchema = itemSchema.extend({
  awarded_to: uuid,
  category: categorySchema.nullable(),
  resolved_round: z.number().int().positive(),
}).strict();
const resolvedRoundSchema = z.object({
  round: z.number().int().positive(),
  challenger_bid: z.number().int().positive().nullable(),
  recipient_bid: z.number().int().positive().nullable(),
  winner: uuid,
  forced: z.boolean(),
  charged_amount: z.number().int().positive(),
}).strict();
const fightBreakdownSelectionSchema = z.object({
  category: categorySchema,
  fighter: z.string().min(1),
  code: z.string().regex(/^[A-Z]{6}$/),
}).strict();
const fightBreakdownSideSchema = z.object({
  name: z.string().min(1),
  score: z.number(),
  selections: z.array(fightBreakdownSelectionSchema).length(5),
}).strict();
export const auctionFightBreakdownPacketSchema = z.object({
  packet_version: z.literal("auction-fight-breakdown-v3"),
  mode: z.literal("ultimate-fighter"),
  winner: z.enum(["challenger", "recipient", "tie"]),
  challenger: fightBreakdownSideSchema,
  recipient: fightBreakdownSideSchema,
}).strict();

export const auctionProjectionSchema = z.object({
  auction_id: uuid,
  mode_id: z.string().refine(isAuctionModeId, "Unknown Auction mode"),
  challenger_id: uuid,
  challenger_display_name: z.string().min(1),
  recipient_id: uuid,
  recipient_display_name: z.string().min(1),
  lifecycle_state: lifecycleSchema,
  current_round: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  tie_priority_profile_id: uuid,
  challenger_bankroll: z.number().int().nonnegative(),
  recipient_bankroll: z.number().int().nonnegative(),
  challenger_selection_count: z.number().int().nonnegative(),
  recipient_selection_count: z.number().int().nonnegative(),
  current_user_submitted_bid: z.boolean(),
  action_required_by: z.enum(["challenger", "recipient", "current_user", "opponent", "none"]),
  challenge_code: z.string().nullable(),
  cancelled_by: uuid.nullable(),
  cancelled_at: z.string().nullable(),
  challenger_final_score: z.number().nullable(),
  recipient_final_score: z.number().nullable(),
  winner_profile_id: uuid.nullable(),
  is_tie: z.boolean(),
  awarded_collections: z.array(awardSchema),
  challenge_id: uuid.nullable(),
  current_item: itemSchema.nullable(),
  resolved_rounds: z.array(resolvedRoundSchema),
}).strict();

type AuctionProjectionRow = z.infer<typeof auctionProjectionSchema>;
export type AuctionLifecycle = z.infer<typeof lifecycleSchema>;
export type AuctionItem = z.infer<typeof itemSchema>;
export type AuctionAward = z.infer<typeof awardSchema>;
export type AuctionResolvedRound = z.infer<typeof resolvedRoundSchema>;
export type AuctionFightBreakdownPacket = z.infer<typeof auctionFightBreakdownPacketSchema>;
export type AuctionProjection = Omit<AuctionProjectionRow, "mode_id"> & { mode_id: AuctionModeId };

export class AuctionRepositoryError extends Error {
  stale: boolean;
  constructor(message: string) {
    const stale = /stale revision|wrong round|already sent|locked/i.test(message);
    super(stale ? "This Auction changed elsewhere. We reloaded the latest round." : message);
    this.name = "AuctionRepositoryError";
    this.stale = stale;
  }
}

type RpcClient = { rpc: (name: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message?: string } | null }> };

async function rpc(client: RpcClient, name: string, args: Record<string, unknown>) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new AuctionRepositoryError(error.message || "Auction could not be updated.");
  return data;
}

export interface AuctionRepository {
  prepare(recipientId: string, modeId: AuctionModeId): Promise<AuctionProjection>;
  read(auctionId: string): Promise<AuctionProjection>;
  fightBreakdownPacket(auctionId: string): Promise<AuctionFightBreakdownPacket>;
  bid(state: AuctionProjection, amount: number, category?: UltimateFighterCategory): Promise<AuctionProjection>;
  abandon(state: AuctionProjection): Promise<void>;
  cancel(state: AuctionProjection): Promise<AuctionProjection>;
}

export function createAuctionRepository(client: RpcClient | null = getSupabaseClient()): AuctionRepository | null {
  if (!client) return null;
  const read = async (auctionId: string) => {
    const data = await rpc(client, "get_auction_participant_state", { p_auction_id: auctionId });
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new AuctionRepositoryError("That Auction is unavailable.");
    return auctionProjectionSchema.parse(row) as AuctionProjection;
  };
  return {
    async prepare(recipientId, modeId) {
      const id = await rpc(client, "prepare_auction", { p_recipient_id: recipientId, p_mode_id: modeId });
      if (typeof id !== "string") throw new AuctionRepositoryError("Auction preparation returned an invalid game.");
      return read(id);
    },
    read,
    async fightBreakdownPacket(auctionId) {
      const data = await rpc(client, "get_auction_fight_breakdown_packet", { p_auction_id: auctionId });
      return auctionFightBreakdownPacketSchema.parse(data);
    },
    async bid(state, amount, category) {
      const common = { p_auction_id: state.auction_id, p_expected_revision: state.revision, p_amount: amount, p_category: category ?? null };
      if (state.lifecycle_state === "prepared") {
        await rpc(client, "send_auction_first_bid", common);
      } else {
        await rpc(client, "submit_auction_bid", { ...common, p_round: state.current_round });
      }
      return read(state.auction_id);
    },
    async abandon(state) {
      await rpc(client, "abandon_prepared_auction", { p_auction_id: state.auction_id, p_expected_revision: state.revision });
    },
    async cancel(state) {
      await rpc(client, "cancel_auction", { p_auction_id: state.auction_id, p_expected_revision: state.revision });
      return read(state.auction_id);
    },
  };
}

export function formatOctagonVerdictPrompt(packet: AuctionFightBreakdownPacket) {
  const winnerName = packet.winner === "challenger"
    ? packet.challenger.name
    : packet.winner === "recipient"
      ? packet.recipient.name
      : "TRUE TIE";
  const orderedSelections = (side: AuctionFightBreakdownPacket["challenger"]) => ULTIMATE_FIGHTER_CATEGORIES.map((category) => {
    const selection = side.selections.find((item) => item.category === category);
    if (!selection) throw new AuctionRepositoryError(`Octagon Verdict packet is missing ${category}.`);
    return `${category}: ${selection.fighter} [${selection.code}]`;
  }).join("\n");

  return [
    "OCTAGON HQ — BUILD THE ULTIMATE FIGHTER",
    "",
    "Analyze this completed matchup using the private Auction rating-code decoder in your Octagon Verdict knowledge.",
    "Treat the recorded Auction winner and scores as authoritative. Use the private codes only to explain how the two five-category builds match up.",
    "Do not reveal, print, translate, or list the hidden rating values or the decoder mapping.",
    "Give me a concise fight breakdown of how the matchup likely plays out.",
    "",
    "RESULT",
    `${packet.challenger.name} ${packet.challenger.score}`,
    `${packet.recipient.name} ${packet.recipient.score}`,
    `Winner: ${winnerName}`,
    "",
    packet.challenger.name,
    orderedSelections(packet.challenger),
    "",
    packet.recipient.name,
    orderedSelections(packet.recipient),
  ].join("\n");
}

export function maximumLegalAuctionBid(state: AuctionProjection, profileId: string) {
  const challenger = state.challenger_id === profileId;
  const bankroll = challenger ? state.challenger_bankroll : state.recipient_bankroll;
  const selections = challenger ? state.challenger_selection_count : state.recipient_selection_count;
  const required = auctionModeDefinition(state.mode_id).requiredSelectionsPerPlayer;
  return bankroll - Math.max(0, required - selections - 1);
}

export function validateAuctionBid(amount: string, maximum: number, categoryRequired: boolean, category: string) {
  if (!/^\d+$/.test(amount) || Number(amount) < 1) return "Enter a whole-dollar bid of at least $1.";
  if (Number(amount) > maximum) return `Keep at least $1 for every open slot. Maximum bid: $${maximum}.`;
  if (categoryRequired && !ULTIMATE_FIGHTER_CATEGORIES.includes(category as UltimateFighterCategory)) return "Choose an available category.";
  return "";
}
