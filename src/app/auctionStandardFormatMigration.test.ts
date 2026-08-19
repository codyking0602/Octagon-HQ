import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310032_auction_standard_format.sql",
  "utf8",
);

describe("Auction standard format migration", () => {
  it("rotates new preparations onto an immutable v3 format marker", () => {
    expect(migration).toContain("'ufc-auction-2026-08-v3'");
    expect(migration).toContain("'balanced-rarity-2026-08-v2'");
    expect(migration).toContain("'ufc-private-grader-2026-08-v2'");
    expect(migration).toContain("from private.auction_catalog");
    expect(migration).toContain("where content_version = 'ufc-auction-2026-08-v2'");
  });

  it("updates each existing server rule owner in place with drift guards", () => {
    for (const owner of [
      "private.validate_auction_private_row()",
      "public.prepare_auction(uuid,text)",
      "private.validate_auction_bid(private.auction_games,uuid,numeric,text)",
      "private.resolve_auction_round(uuid)",
      "private.grade_auction(uuid)",
    ]) {
      expect(migration).toContain(`'${owner}'::regprocedure`);
    }
    expect(migration).toContain("Auction format migration owner drifted");
    expect(migration).toContain("then 6 else 8");
    expect(migration).toContain("then 3 else 4");
    expect(migration).toContain("then 30 else 40");
    expect(migration).not.toMatch(/create(?: or replace)? function/i);
  });

  it("locks v3 active snapshots while retaining historical pinned games", () => {
    expect(migration).toContain("when content_version = 'ufc-auction-2026-08-v3' then 6");
    expect(migration).toContain("when content_version = 'ufc-auction-2026-08-v3' then 3");
    expect(migration).toContain("when content_version = 'ufc-auction-2026-08-v3' then 30");
    expect(migration).toContain("lifecycle_state in ('completed', 'cancelled', 'abandoned')");
  });
});
