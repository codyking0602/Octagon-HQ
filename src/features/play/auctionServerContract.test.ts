import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS, type AuctionModeId } from "./auctionContract";

interface FixtureItem {
  reference: string;
  label: string;
}

const catalog = Array.from({ length: 14 }, (_, index) => ({
  reference: `item-${String(index + 1).padStart(2, "0")}`,
  label: `Item ${index + 1}`,
}));

function simulatePrivateDeck(
  modeId: AuctionModeId,
  items: readonly FixtureItem[],
  randomOrder: readonly number[],
): FixtureItem[] {
  const deckLength = modeId === "ultimate-fighter" ? 10 : 8;
  const orderedItems = [...items].sort((left, right) =>
    left.reference.localeCompare(right.reference),
  );

  if (new Set(orderedItems.map((item) => item.reference)).size !== items.length) {
    throw new Error("Catalog item references must be unique.");
  }

  if (orderedItems.length < deckLength || randomOrder.length < orderedItems.length) {
    throw new Error("The deterministic test fixture does not cover the catalog.");
  }

  return orderedItems
    .map((item, index) => {
      const randomKey = randomOrder[index];
      if (randomKey === undefined || randomKey < 0 || randomKey >= 1) {
        throw new Error("Random source values must be between 0 and 1.");
      }
      return { item, randomKey };
    })
    .sort(
      (left, right) =>
        left.randomKey - right.randomKey ||
        left.item.reference.localeCompare(right.item.reference),
    )
    .slice(0, deckLength)
    .map(({ item }) => item);
}

describe("Auction private deck simulation", () => {
  it("reproduces deterministic unique decks for every locked mode", () => {
    const randomOrder = catalog.map((_, index) => ((index * 7) % 13) / 13);

    for (const modeId of AUCTION_MODE_IDS) {
      const first = simulatePrivateDeck(modeId, catalog, randomOrder);
      const second = simulatePrivateDeck(modeId, catalog, randomOrder);
      const expectedLength = modeId === "ultimate-fighter" ? 10 : 8;

      expect(first).toEqual(second);
      expect(first).toHaveLength(expectedLength);
      expect(new Set(first.map((item) => item.reference)).size).toBe(
        expectedLength,
      );
    }
  });

  it("uses the mode length rather than the temporary fixture count", () => {
    const largerCatalog = Array.from({ length: 30 }, (_, index) => ({
      reference: `future-item-${String(index + 1).padStart(2, "0")}`,
      label: `Future Item ${index + 1}`,
    }));
    const randomOrder = largerCatalog.map((_, index) => index / 30);

    expect(simulatePrivateDeck("strikers", largerCatalog, randomOrder)).toHaveLength(8);
    expect(
      simulatePrivateDeck("ultimate-fighter", largerCatalog, randomOrder),
    ).toHaveLength(10);
  });

  it("rejects duplicate identities and invalid deterministic randomness", () => {
    expect(() =>
      simulatePrivateDeck(
        "strikers",
        [...catalog, catalog[0]!],
        Array.from({ length: 15 }, (_, index) => index / 15),
      ),
    ).toThrow(/unique/);

    expect(() =>
      simulatePrivateDeck(
        "strikers",
        catalog,
        catalog.map(() => 1),
      ),
    ).toThrow(/between 0 and 1/);
  });
});
