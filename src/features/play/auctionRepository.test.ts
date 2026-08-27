import { describe, expect, it, vi } from "vitest";
import { auctionFightBreakdownPacketSchema, auctionProjectionSchema, createAuctionRepository, maximumLegalAuctionBid, validateAuctionBid } from "./auctionRepository";

const firstItem = { deck_position: 1, item_reference: "fixture-1", display_label: "Mystery Fighter" };
const projection = auctionProjectionSchema.parse({
  auction_id: "10000000-0000-4000-8000-000000000001", mode_id: "ultimate-fighter",
  challenger_id: "10000000-0000-4000-8000-000000000002", challenger_display_name: "CODY",
  recipient_id: "10000000-0000-4000-8000-000000000003", recipient_display_name: "RIVAL",
  lifecycle_state: "prepared", current_round: 1, revision: 0,
  tie_priority_profile_id: "10000000-0000-4000-8000-000000000002",
  challenger_bankroll: 50, recipient_bankroll: 50, challenger_selection_count: 0, recipient_selection_count: 0,
  current_user_submitted_bid: false, action_required_by: "challenger", challenge_code: null,
  cancelled_by: null, cancelled_at: null, challenger_final_score: null, recipient_final_score: null,
  winner_profile_id: null, is_tie: false, awarded_collections: [], challenge_id: null,
  current_item: firstItem, resolved_rounds: [],
});

const breakdownPacket = auctionFightBreakdownPacketSchema.parse({
  packet_version: "auction-fight-breakdown-v2",
  mode: "ultimate-fighter",
  winner: "challenger",
  recap: [
    "CODY's build likely gets the win.",
    "Fighter A gives CODY the biggest edge in striking, helping the build win the cleaner exchanges on the feet.",
    "Fighter B gives RIVAL a real answer through the clinch and mat phases, but CODY has the stronger five-category path.",
  ],
  challenger: {
    name: "CODY",
    score: 88,
    selections: ["Striking", "Grappling", "Frame", "Power", "Heart"].map((category, index) => ({
      category,
      fighter: `Cody Fighter ${index + 1}`,
      code: `CODE-${index + 1}`,
    })),
  },
  recipient: {
    name: "RIVAL",
    score: 82,
    selections: ["Striking", "Grappling", "Frame", "Power", "Heart"].map((category, index) => ({
      category,
      fighter: `Rival Fighter ${index + 1}`,
      code: `RIVAL-${index + 1}`,
    })),
  },
});

describe("Auction frontend repository", () => {
  it("strictly validates only the participant-safe projection", () => {
    expect(auctionProjectionSchema.parse(projection).current_item).toEqual(firstItem);
    expect(() => auctionProjectionSchema.parse({ ...projection, future_deck: [firstItem] })).toThrow();
    expect(() => auctionProjectionSchema.parse({ ...projection, pending_opponent_bid: 12 })).toThrow();
    expect(() => auctionProjectionSchema.parse({ ...projection, grading_weights: {} })).toThrow();
    expect(() => auctionProjectionSchema.parse({ ...projection, pending_category_intent: "Heart" })).toThrow();
    expect(() => auctionProjectionSchema.parse({ ...projection, rarity_version: "private-v1" })).toThrow();
  });

  it("owns preparation, canonical read, first-bid send, and active commands", async () => {
    const rpc = vi.fn(async (name: string, _args?: Record<string, unknown>) => {
      if (name === "prepare_auction") return { data: projection.auction_id, error: null };
      if (name === "get_auction_participant_state") return { data: [projection], error: null };
      return { data: 1, error: null };
    });
    const repository = createAuctionRepository({ rpc })!;
    const state = await repository.prepare(projection.recipient_id, "ultimate-fighter");
    await repository.bid(state, 20, "Heart");
    await repository.abandon(state);
    expect(rpc.mock.calls.map(([name]) => name)).toEqual([
      "prepare_auction", "get_auction_participant_state",
      "send_auction_first_bid", "get_auction_participant_state", "abandon_prepared_auction",
    ]);
    expect(rpc.mock.calls[2]?.[1]).toEqual({
      p_auction_id: projection.auction_id, p_expected_revision: 0, p_amount: 20, p_category: "Heart",
    });
  });

  it("reads fight recap prose only through the existing participant breakdown packet", async () => {
    const rpc = vi.fn(async () => ({ data: breakdownPacket, error: null }));
    const repository = createAuctionRepository({ rpc })!;
    await expect(repository.fightRecap(projection.auction_id)).resolves.toEqual(breakdownPacket.recap);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("get_auction_fight_breakdown_packet", {
      p_auction_id: projection.auction_id,
    });
  });

  it("rejects extra hidden fields in the fight breakdown packet", () => {
    expect(() => auctionFightBreakdownPacketSchema.parse({
      ...breakdownPacket,
      private_analysis: { category_edges: [] },
    })).toThrow();
  });

  it("turns stale revisions into understandable reload errors", async () => {
    const repository = createAuctionRepository({ rpc: async () => ({ data: null, error: { message: "stale revision" } }) })!;
    await expect(repository.read(projection.auction_id)).rejects.toMatchObject({ stale: true, message: expect.stringContaining("reloaded") });
  });

  it("enforces reserve, whole dollars, and Ultimate Fighter category selection", () => {
    expect(maximumLegalAuctionBid(projection, projection.challenger_id)).toBe(46);
    expect(validateAuctionBid("1.5", 46, false, "")).toContain("whole-dollar");
    expect(validateAuctionBid("47", 46, false, "")).toContain("Maximum bid: $46");
    expect(validateAuctionBid("20", 46, true, "")).toContain("category");
    expect(validateAuctionBid("20", 46, true, "Heart")).toBe("");
  });

  it("reserves cash for the remaining slots in the standard three-item format", () => {
    const standard = {
      ...projection,
      mode_id: "strikers" as const,
      challenger_bankroll: 30,
      challenger_selection_count: 0,
    };
    expect(maximumLegalAuctionBid(standard, standard.challenger_id)).toBe(28);
    expect(maximumLegalAuctionBid({ ...standard, challenger_selection_count: 1 }, standard.challenger_id)).toBe(29);
  });
});
