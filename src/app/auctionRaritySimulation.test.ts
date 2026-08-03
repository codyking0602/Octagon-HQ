import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "../features/play/auctionContract";

const migrationFiles = readdirSync("supabase/migrations")
  .filter((name) => /^20260902000[1-8]_auction_.*\.sql$/.test(name))
  .map((name) => join("supabase/migrations", name));
const sql = migrationFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const catalogRows = [...sql.matchAll(/\$auction_catalog_rows\$\s*([\s\S]*?)\s*\$auction_catalog_rows\$/g)]
  .flatMap((match) => match[1]!.trim().split("\n"));
if (!catalogRows.length) throw new Error("Auction catalog row blocks are missing");

type CatalogItem = {
  mode_id: string;
  item_reference: string;
  display_label: string;
  rarity_band: number;
  generation_weight: number;
  private_generation_class: string;
  grading_inputs: Record<string, number>;
};

const counters = new Map<string, number>();
const catalog = catalogRows.map((row): CatalogItem => {
  const [mode_id, display_label, rarity, weight, private_generation_class, scoreText] = row.split("|");
  if (!mode_id || !display_label || !rarity || !weight || !private_generation_class || !scoreText) {
    throw new Error(`Invalid Auction catalog row: ${row}`);
  }
  const itemNumber = (counters.get(mode_id) ?? 0) + 1;
  counters.set(mode_id, itemNumber);
  const scores = scoreText.split(":").map(Number);
  const grading_inputs = mode_id === "ultimate-fighter"
    ? { overall: scores[0]!, Striking: scores[1]!, Grappling: scores[2]!, Frame: scores[3]!, Power: scores[4]!, Heart: scores[5]! }
    : { overall: scores[0]! };
  return {
    mode_id,
    item_reference: `${mode_id}-${itemNumber}`,
    display_label,
    rarity_band: Number(rarity),
    generation_weight: Number(weight),
    private_generation_class,
    grading_inputs,
  };
});
const byMode = new Map(AUCTION_MODE_IDS.map((mode) => [mode, catalog.filter((item) => item.mode_id === mode)]));

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 0x1_0000_0000;
  };
}

function simulateDeck(items: readonly CatalogItem[], count: number, random: () => number) {
  const keyed = items.map((item) => ({
    item,
    key: -Math.log(Math.max(0.0000001, random())) / item.generation_weight,
  })).sort((left, right) => left.key - right.key || left.item.item_reference.localeCompare(right.item.item_reference));

  const mythicCrown = new Set(keyed
    .filter(({ item }) => ["mythic", "crown"].includes(item.private_generation_class))
    .slice(0, 2)
    .map(({ item }) => item.item_reference));
  const featured = new Set(keyed
    .filter(({ item }) => ["ace", "headliner", "signature"].includes(item.private_generation_class))
    .slice(0, 2)
    .map(({ item }) => item.item_reference));
  const highEnd = new Set(keyed
    .filter(({ item }) => item.rarity_band >= 4)
    .slice(0, 4)
    .map(({ item }) => item.item_reference));

  return keyed.filter(({ item }) => {
    if (["mythic", "crown"].includes(item.private_generation_class) && !mythicCrown.has(item.item_reference)) return false;
    if (["ace", "headliner", "signature"].includes(item.private_generation_class) && !featured.has(item.item_reference)) return false;
    if (item.rarity_band >= 4 && !highEnd.has(item.item_reference)) return false;
    return true;
  }).slice(0, count).map(({ item }) => item);
}

describe("Auction PR 5 rarity simulations", () => {
  it("meets deterministic rarity safeguards in statistical simulations", () => {
    const runs = 6_000;
    const random = seededRandom(0x0c7a60);

    const ultimate = byMode.get("ultimate-fighter")!;
    let jonGames = 0;
    for (let index = 0; index < runs; index += 1) {
      const deck = simulateDeck(ultimate, 10, random);
      expect(deck).toHaveLength(10);
      expect(deck.filter((item) => ["mythic", "crown"].includes(item.private_generation_class)).length).toBeLessThanOrEqual(2);
      expect(deck.filter((item) => item.rarity_band >= 4).length).toBeLessThanOrEqual(4);
      if (deck.some((item) => item.display_label === "Jon Jones")) jonGames += 1;
    }
    expect(jonGames / runs).toBeGreaterThanOrEqual(0.01);
    expect(jonGames / runs).toBeLessThanOrEqual(0.025);

    for (const mode of ["strikers", "grapplers", "knockout-artists"] as const) {
      const items = byMode.get(mode)!;
      const aces = items.filter((item) => item.private_generation_class === "ace");
      const appearances = new Map(aces.map((item) => [item.item_reference, 0]));
      for (let index = 0; index < runs; index += 1) {
        const deck = simulateDeck(items, 8, random);
        expect(deck.filter((item) => item.private_generation_class === "ace").length).toBeLessThanOrEqual(2);
        for (const ace of aces) if (deck.some((item) => item.item_reference === ace.item_reference)) appearances.set(ace.item_reference, appearances.get(ace.item_reference)! + 1);
      }
      for (const count of appearances.values()) {
        expect(count / runs, mode).toBeGreaterThanOrEqual(0.20);
        expect(count / runs, mode).toBeLessThanOrEqual(0.30);
      }
    }

    for (const mode of ["fighter-performances", "greatest-ufc-card", "championship-performances", "finishes", "dominant-performances", "wars", "rivalries", "iconic-moments"] as const) {
      const items = byMode.get(mode)!;
      let gamesWithHeadliner = 0;
      for (let index = 0; index < runs; index += 1) {
        const deck = simulateDeck(items, 8, random);
        const headliners = deck.filter((item) => item.private_generation_class === "headliner");
        if (headliners.length) gamesWithHeadliner += 1;
        expect(headliners.length).toBeLessThanOrEqual(2);
      }
      expect(gamesWithHeadliner / runs, mode).toBeGreaterThanOrEqual(0.60);
      expect(gamesWithHeadliner / runs, mode).toBeLessThanOrEqual(0.75);
    }
  });
});
