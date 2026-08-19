import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "./auctionContract";
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
  it("generates deterministic unique decks for every locked mode", () => {
    const values = [0.1, 0.8, 0.3, 0.6];

    for (const modeId of AUCTION_MODE_IDS) {
      const first = sampleAuctionDeck(modeId, catalog, deterministic(values));
      const second = sampleAuctionDeck(modeId, catalog, deterministic(values));
      const expectedLength = modeId === "ultimate-fighter" ? 10 : 6;

      expect(first).toEqual(second);
      expect(first).toHaveLength(expectedLength);
      expect(new Set(first.map((item) => item.reference)).size).toBe(
        expectedLength,
      );
    }
  });

  it("uses requested mode length rather than the temporary fixture count", () => {
    const largerCatalog = Array.from({ length: 30 }, (_, index) => ({
      reference: `future-item-${index + 1}`,
      label: `Future Item ${index + 1}`,
    }));

    expect(
      sampleAuctionDeck("strikers", largerCatalog, () => 0.42),
    ).toHaveLength(6);
    expect(
      sampleAuctionDeck("ultimate-fighter", largerCatalog, () => 0.42),
    ).toHaveLength(10);
  });

  it("rejects duplicate catalog identities and invalid randomness", () => {
    expect(() =>
      sampleAuctionDeck("strikers", [...catalog, catalog[0]!], () => 0.5),
    ).toThrow(/unique/);
    expect(() => sampleAuctionDeck("strikers", catalog, () => 1)).toThrow(
      /Random source/,
    );
  });
});
