import { auctionModeDefinition, type AuctionModeId } from "./auctionContract";

export const AUCTION_CONTENT_VERSION = "fixture-2026-08-22-v1";
export const AUCTION_RARITY_VERSION = "rarity-fixture-v1";
export const AUCTION_GRADING_VERSION = "grader-contract-v1";

export interface AuctionCatalogItem {
  reference: string;
  label: string;
}

/**
 * Server/test deck sampler contract. Production randomness is supplied by the
 * database command; callers never receive a seed or generator state.
 */
export function sampleAuctionDeck(
  modeId: AuctionModeId,
  catalog: readonly AuctionCatalogItem[],
  random: () => number,
): AuctionCatalogItem[] {
  const count = auctionModeDefinition(modeId).rounds;
  if (catalog.length < count) throw new Error("Catalog does not contain enough unique items");
  const unique = new Map(catalog.map((item) => [item.reference, item]));
  if (unique.size !== catalog.length) throw new Error("Catalog item references must be unique");

  const pool = [...catalog];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Random source must return [0, 1)");
    const swap = Math.floor(value * (index + 1));
    [pool[index], pool[swap]] = [pool[swap]!, pool[index]!];
  }
  return pool.slice(0, count);
}
