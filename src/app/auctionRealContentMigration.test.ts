import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS, auctionModeDefinition } from "../features/play/auctionContract";
import { rankedPlayFighters } from "../features/play/playFighterPool";

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

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

describe("Auction PR 5 private content and grader", () => {
  it("owns one UFC-only catalog for every approved mode", () => {
    expect([...new Set(catalog.map((item) => item.mode_id))].sort()).toEqual([...AUCTION_MODE_IDS].sort());
    expect(catalog).toHaveLength(328);

    for (const mode of AUCTION_MODE_IDS) {
      const items = byMode.get(mode)!;
      const minimum = mode === "ultimate-fighter" ? 30
        : ["strikers", "grapplers", "knockout-artists"].includes(mode) ? 16
          : ["jon-jones-performances", "conor-mcgregor-performances", "charles-oliveira-performances"].includes(mode) ? 10
            : 24;
      expect(items.length, mode).toBeGreaterThanOrEqual(minimum);
      expect(new Set(items.map((item) => item.item_reference)).size, mode).toBe(items.length);
      expect(new Set(items.map((item) => item.display_label.toLocaleLowerCase())).size, mode).toBe(items.length);
      expect(items.length, mode).toBeGreaterThanOrEqual(auctionModeDefinition(mode).rounds);
      for (const item of items) {
        expect(item.rarity_band, item.item_reference).toBeGreaterThanOrEqual(1);
        expect(item.rarity_band, item.item_reference).toBeLessThanOrEqual(5);
        expect(item.generation_weight, item.item_reference).toBeGreaterThan(0);
      }
    }

    expect(catalog.map((item) => item.display_label).join("\n")).not.toMatch(/Pride|Strikeforce|\bWEC\b|Bellator|ONE Championship|regional/i);
    expect(sql).not.toMatch(/best-chins|best-rounds|best-upsets|goat-resume|build-a-division/);
  });

  it("keeps career and historical pools defensible under the UFC-only rule", () => {
    const conor = byMode.get("conor-mcgregor-performances")!.map((item) => item.display_label);
    expect(conor).toHaveLength(10);
    expect(conor).not.toContain("Conor McGregor vs Khabib Nurmagomedov — UFC 229");
    expect(conor).not.toContain("Conor McGregor vs Nate Diaz — UFC 196");

    const knockoutArtists = byMode.get("knockout-artists")!.map((item) => item.display_label);
    expect(knockoutArtists).toContain("Mauricio Rua");
    expect(knockoutArtists).toContain("Thiago Santos");
    expect(knockoutArtists).not.toContain("Wanderlei Silva");
    expect(knockoutArtists).not.toContain("Quinton Jackson");

    const finishes = byMode.get("finishes")!.map((item) => item.display_label);
    expect(finishes).toContain("Charles Oliveira submits Dustin Poirier — UFC 269");
    expect(finishes).not.toContain("Charles Oliveira stops Michael Chandler — UFC 309");

    const wars = byMode.get("wars")!.map((item) => item.display_label);
    expect(wars).toContain("Khamzat Chimaev vs Gilbert Burns — UFC 273");
    expect(wars).not.toContain("Zhang Weili vs Yan Xiaonan — UFC 300");
  });

  it("locks Ultimate Fighter career, striking, and grappling values to canonical owners", () => {
    const playByName = new Map(rankedPlayFighters.map((fighter) => [fighter.name, fighter]));
    const ultimate = byMode.get("ultimate-fighter")!;
    expect(ultimate).toHaveLength(30);

    for (const item of ultimate) {
      const fighter = playByName.get(item.display_label);
      expect(fighter, item.display_label).toBeDefined();
      expect(item.grading_inputs.overall, item.display_label).toBe(fighter!.ratings.career);
      expect(item.grading_inputs.Striking, item.display_label).toBe(fighter!.ratings.striking);
      expect(item.grading_inputs.Grappling, item.display_label).toBe(fighter!.ratings.grappling);
      expect(Object.keys(item.grading_inputs).sort()).toEqual([
        "Frame", "Grappling", "Heart", "Power", "Striking", "overall",
      ]);
    }

    const jon = ultimate.find((item) => item.display_label === "Jon Jones");
    expect(jon?.grading_inputs.overall).toBe(99);
    expect(jon?.private_generation_class).toBe("mythic");
  });

  it("uses only one scalar private grade outside Ultimate Fighter", () => {
    for (const item of catalog.filter((entry) => entry.mode_id !== "ultimate-fighter")) {
      expect(Object.keys(item.grading_inputs), item.item_reference).toEqual(["overall"]);
      expect(item.grading_inputs.overall, item.item_reference).toBeGreaterThanOrEqual(0);
      expect(item.grading_inputs.overall, item.item_reference).toBeLessThanOrEqual(100);
    }
  });

  it("keeps rarity, values, and grading internals out of runtime source and the participant projection", () => {
    const runtimeSource = sourceFiles("src").map((path) => readFileSync(path, "utf8")).join("\n");
    expect(runtimeSource).not.toMatch(/generation_weight|private_generation_class|grading_inputs/);
    expect(runtimeSource).not.toContain("Anderson Silva vs Forrest Griffin — UFC 101");

    const serverMigration = readFileSync("supabase/migrations/202608220001_auction_playable_server_engine.sql", "utf8");
    const projection = serverMigration.match(/create function public\.get_auction_participant_state[\s\S]*?\nas \$\$([\s\S]*?)\n\$\$;/)?.[1];
    expect(projection).toBeTruthy();
    expect(projection).not.toMatch(/generation_weight|private_generation_class|grading_inputs|display_description|rarity_band/);

    expect(sql).toContain("create or replace function private.grade_auction");
    expect(sql).toContain("v_game.grading_version = 'grader-contract-v1'");
    expect(sql).toContain("v_game.grading_version <> 'ufc-private-grader-2026-08-v1'");
    expect(sql).toMatch(/revoke all on function private\.grade_auction\(uuid\)[\s\S]*?from public, anon, authenticated/);
    expect(sql).not.toMatch(/challenger_bankroll[^;]*score|recipient_bankroll[^;]*score/i);

    const artifactVerifier = readFileSync("scripts/verify-production-artifact.mjs", "utf8");
    for (const marker of [
      "generation_weight",
      "private_generation_class",
      "grading_inputs",
      "Anderson Silva vs Forrest Griffin — UFC 101",
    ]) {
      expect(artifactVerifier).toContain(`\"${marker}\"`);
    }
  });
});
