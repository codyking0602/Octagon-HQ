import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310032_auction_standard_format.sql",
  "utf8",
);

describe("Auction standard format migration", () => {
  it("updates each existing server rule owner in place", () => {
    for (const owner of [
      "private.validate_auction_private_row()",
      "public.prepare_auction(uuid,text)",
      "private.validate_auction_bid(private.auction_games,uuid,numeric,text)",
      "private.resolve_auction_round(uuid)",
      "private.grade_auction(uuid)",
    ]) {
      expect(migration).toContain(`'${owner}'::regprocedure`);
    }
    expect(migration).toContain("'then 10 else 6'");
    expect(migration).toContain("'then 5 else 3'");
    expect(migration).toContain("'then 50 else 30'");
    expect(migration).not.toMatch(/create(?: or replace)? function/i);
  });

  it("locks active snapshots while retaining terminal historical games", () => {
    expect(migration).toContain("else 6");
    expect(migration).toContain("else 3");
    expect(migration).toContain("else 30");
    expect(migration).toContain("lifecycle_state in ('completed', 'declined', 'cancelled')");
  });
});
