import { describe, expect, it } from "vitest";
import v1FighterCatalog from "../../../supabase/migrations/202609020002_auction_real_ufc_catalog_fighters.sql?raw";
import v2Catalog from "../../../supabase/migrations/202609040001_auction_catalog_expansion.sql?raw";
import menOnlyMigration from "../../../supabase/migrations/202612310063_auction_ultimate_fighter_men_only.sql?raw";
import { rankedPlayFighters } from "./playFighterPool";

function normalizeName(value: string) {
  return value
    .replaceAll("’", "'")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function reviewedV7UltimateFighterRows() {
  const copiedV1 = [...v1FighterCatalog.matchAll(/^ultimate-fighter\|([^|]+)\|/gm)]
    .map((match, index) => ({
      itemReference: `ultimate-fighter-${index + 1}`,
      name: match[1]!,
    }));
  const addedV2 = [...v2Catalog.matchAll(/'ultimate-fighter','(ultimate-fighter-\d+)','((?:[^']|'')*)'/g)]
    .map((match) => ({
      itemReference: match[1]!,
      name: match[2]!.replaceAll("''", "'"),
    }));
  return [...copiedV1, ...addedV2];
}

function migrationExcludedRefs() {
  const block = menOnlyMigration.match(
    /with excluded_v7_women\(item_reference\) as \(\s*values([\s\S]*?)\n\)\ninsert into private\.auction_catalog/,
  );
  expect(block).not.toBeNull();
  return [...block![1]!.matchAll(/\('([^']+)'\)/g)].map((match) => match[1]!);
}

describe("Build the Ultimate Fighter men-only v8", () => {
  it("excludes exactly the women in the immutable v7 Ultimate Fighter snapshot", () => {
    const v7Rows = reviewedV7UltimateFighterRows();
    expect(v7Rows).toHaveLength(80);

    const canonicalWomen = new Set(
      rankedPlayFighters
        .filter((fighter) => fighter.gender === "women")
        .map((fighter) => normalizeName(fighter.name)),
    );
    const womenInV7 = v7Rows
      .filter((row) => canonicalWomen.has(normalizeName(row.name)))
      .map((row) => row.itemReference)
      .sort();
    const excluded = migrationExcludedRefs().sort();

    expect(womenInV7).toHaveLength(14);
    expect(excluded).toEqual(womenInV7);
    expect(v7Rows.length - excluded.length).toBe(66);
  });

  it("rotates only new preparations to v8 while preserving v7 history", () => {
    expect(menOnlyMigration).toContain("'ufc-auction-2026-08-v8'");
    expect(menOnlyMigration).toContain("'ufc-private-grader-2026-08-v3'");
    expect(menOnlyMigration).toContain("source.content_version = 'ufc-auction-2026-08-v7'");
    expect(menOnlyMigration).toContain("Historical v7 Auction contract was mutated");
    expect(menOnlyMigration).toContain("V8 is not the single Auction preparation contract");
  });

  it("copies retained v7 rows byte-for-byte and filters only Ultimate Fighter", () => {
    expect(menOnlyMigration).toContain("source.mode_id = 'ultimate-fighter'");
    expect(menOnlyMigration).toContain("excluded.item_reference = source.item_reference");
    expect(menOnlyMigration).toContain("V8 changed retained Auction content, weights, classes, or grading inputs");
    expect(menOnlyMigration).toContain("V8 Ultimate Fighter pool is not the reviewed 66-man pool");
    expect(menOnlyMigration).not.toMatch(/update\s+private\.auction_catalog\s/i);
    expect(menOnlyMigration).not.toMatch(/delete\s+from\s+private\.auction_catalog/i);
  });

  it("keeps the canonical generator and grader instead of adding competing owners", () => {
    expect(menOnlyMigration).not.toContain("create or replace function private.generate_auction_deck");
    expect(menOnlyMigration).not.toContain("create or replace function private.grade_auction");
    expect(menOnlyMigration).toContain("pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure)");
    expect(menOnlyMigration).toContain("pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure)");
    expect(menOnlyMigration).toContain("pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure)");
  });
});
