import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608220004_auction_catalog_version_rotation.sql",
  "utf8",
);

describe("Auction catalog version rotation hardening", () => {
  it("keeps version identities immutable while allowing the preparation pointer to move", () => {
    expect(sql).toContain(
      "new.content_version is distinct from old.content_version",
    );
    expect(sql).toContain(
      "new.rarity_version is distinct from old.rarity_version",
    );
    expect(sql).toContain(
      "new.grading_version is distinct from old.grading_version",
    );
    expect(sql).toContain(
      "Auction catalog version identities are immutable",
    );
    expect(sql).not.toContain(
      "new.is_preparation_version is distinct from old.is_preparation_version",
    );
    expect(sql).toContain(
      "allowing a reviewed preparation-version pointer change",
    );
  });

  it("validates catalog-backed decks without breaking legacy private fixtures", () => {
    const versionGuard = sql.indexOf(
      "from private.auction_catalog_versions version",
    );
    const catalogGuard = sql.indexOf("from private.auction_catalog catalog");

    expect(versionGuard).toBeGreaterThanOrEqual(0);
    expect(catalogGuard).toBeGreaterThan(versionGuard);
    expect(sql).toContain("catalog.mode_id = v_mode_id");
    expect(sql).toContain(
      "catalog.item_reference = new.private_item_reference",
    );
    expect(sql).toContain(
      "Auction deck item is not in the pinned catalog",
    );
    expect(sql).toContain(
      "before insert on private.auction_deck_entries",
    );
  });

  it("keeps both hardening helpers private", () => {
    expect(sql).toContain(
      "revoke all on function private.protect_auction_catalog_version()",
    );
    expect(sql).toContain(
      "revoke all on function private.validate_auction_catalog_deck_entry()",
    );
    expect(sql).toContain("from public, anon, authenticated;");
  });
});
