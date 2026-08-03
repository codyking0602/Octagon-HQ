import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "../features/play/auctionContract";

const sql = readFileSync("supabase/migrations/202609020001_auction_real_ufc_catalog_private_grading.sql", "utf8");

describe("Auction PR 5 private content and grader", () => {
  it("owns one real, versioned pool for every and only approved mode", () => {
    for (const mode of AUCTION_MODE_IDS) {
      expect((sql.match(new RegExp(`\\('${mode}'`, "g")) ?? []).length).toBeGreaterThanOrEqual(mode === "ultimate-fighter" ? 30 : 12);
    }
    expect(sql).not.toMatch(/Pride|Strikeforce|WEC|Bellator|ONE Championship|regional/i);
    expect(sql).not.toMatch(/best-chins|best-rounds|best-upsets|goat-resume|build-a-division/);
  });

  it("keeps rarity and grading private and fixed-version", () => {
    expect(sql).toContain("'ufc-auction-2026-08-v1'");
    expect(sql).toContain("'balanced-rarity-2026-08-v1'");
    expect(sql).toContain("'ufc-private-grader-2026-08-v1'");
    expect(sql).toContain("create or replace function private.grade_auction");
    expect(sql).toContain("revoke all on function private.grade_auction(uuid) from public,anon,authenticated");
    expect(sql).toContain("if g.lifecycle_state='completed' then return");
    expect(sql).toContain("when cs>rs then g.challenger_id when rs>cs then g.recipient_id else null");
    expect(sql).not.toContain("bankroll -");
  });

  it("uses weighted no-replacement generation and retains injectable randomness", () => {
    expect(sql).toContain("p_random_order double precision[] default null");
    expect(sql).toContain("-ln(greatest(0.0000001");
    expect(sql).toContain("/generation_weight as weighted_key");
    expect(sql).toContain("limit p_count");
  });
});
