import { describe, expect, it } from "vitest";
import { sampleAuctionDeck } from "./auctionServerContract";

const catalog = Array.from({ length: 14 }, (_, index) => ({
  reference: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}));

function deterministic(values: readonly number[]) {
  let index = 0;
  return () => values[index++ % values.length]!;
}

describe("Auction server catalog contract", () => {
  it("generates a deterministic unique eight-item ordinary deck", () => {
    const values = [0.1, 0.8, 0.3, 0.6];
    const first = sampleAuctionDeck("strikers", catalog, deterministic(values));
    const second = sampleAuctionDeck("strikers", catalog, deterministic(values));
    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(new Set(first.map((item) => item.reference)).size).toBe(8);
  });

  it("generates ten items for Ultimate Fighter without assuming fixture size", () => {
    const deck = sampleAuctionDeck("ultimate-fighter", catalog, () => 0.42);
    expect(deck).toHaveLength(10);
    expect(new Set(deck.map((item) => item.reference)).size).toBe(10);
  });

  it("rejects duplicate catalog identities and invalid randomness", () => {
    expect(() => sampleAuctionDeck("strikers", [...catalog, catalog[0]!], () => 0.5)).toThrow(/unique/);
    expect(() => sampleAuctionDeck("strikers", catalog, () => 1)).toThrow(/Random source/);
  });
});
