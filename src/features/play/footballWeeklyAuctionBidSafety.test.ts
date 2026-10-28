import { describe, expect, it } from "vitest";
import { evaluateFootballWeeklyAuctionBids, evaluateFootballWeeklyBuildQbBids } from "./footballWeeklyAuctionBidSafety";

describe("Football Weekly Auction bid safety", () => {
  it("lets one-team owners commit the full bankroll across two bids that can finish the collection", () => {
    expect(evaluateFootballWeeklyAuctionBids(30, 1, { 1: 0, 2: 19, 3: 11 })).toEqual({
      legal: true,
      committed: 30,
      message: null,
    });
    expect(evaluateFootballWeeklyAuctionBids(30, 1, { 1: 29, 2: 1, 3: 0 }).legal).toBe(true);
  });

  it("still blocks a one-team owner from risking the entire bankroll on only one possible win", () => {
    const result = evaluateFootballWeeklyAuctionBids(30, 1, { 1: 30, 2: 0, 3: 0 });
    expect(result.legal).toBe(false);
    expect(result.message).toContain("Keep at least $1");
  });

  it("lets zero-team owners use the full bankroll when all three bids preserve a path to three teams", () => {
    expect(evaluateFootballWeeklyAuctionBids(40, 0, { 1: 38, 2: 1, 3: 1 }).legal).toBe(true);
    expect(evaluateFootballWeeklyAuctionBids(40, 0, { 1: 20, 2: 19, 3: 1 }).legal).toBe(true);
  });

  it("protects zero-team owners against getting stranded after one or two expensive wins", () => {
    expect(evaluateFootballWeeklyAuctionBids(40, 0, { 1: 39, 2: 1, 3: 0 }).legal).toBe(false);
    expect(evaluateFootballWeeklyAuctionBids(40, 0, { 1: 38, 2: 2, 3: 0 }).legal).toBe(false);
  });

  it("allows the full remaining bankroll once only one more team is needed", () => {
    expect(evaluateFootballWeeklyAuctionBids(17, 2, { 1: 17, 2: 0, 3: 0 }).legal).toBe(true);
  });

  it("never allows total commitments above the remaining bankroll", () => {
    const result = evaluateFootballWeeklyAuctionBids(30, 1, { 1: 20, 2: 11, 3: 0 });
    expect(result.legal).toBe(false);
    expect(result.message).toBe("Today’s bids can total at most $30.");
  });
});


describe("Football Weekly Build a QB bid safety", () => {
  it("allows the locked four-trait full-bankroll split", () => {
    expect(evaluateFootballWeeklyBuildQbBids(40, 0, { 1: 37, 2: 1, 3: 1, 4: 1 }).legal).toBe(true);
    expect(evaluateFootballWeeklyBuildQbBids(40, 0, { 1: 20, 2: 10, 3: 5, 4: 5 }).legal).toBe(true);
  });

  it("blocks a player from stranding future traits after one expensive win", () => {
    expect(evaluateFootballWeeklyBuildQbBids(40, 0, { 1: 40, 2: 0, 3: 0, 4: 0 }).legal).toBe(false);
    expect(evaluateFootballWeeklyBuildQbBids(40, 0, { 1: 38, 2: 2, 3: 0, 4: 0 }).legal).toBe(false);
  });

  it("allows all-in bidding once only one trait remains", () => {
    expect(evaluateFootballWeeklyBuildQbBids(13, 3, { 1: 0, 2: 0, 3: 13, 4: 0 }).legal).toBe(true);
  });
});
