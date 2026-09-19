import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310155_football_weekly_auction_owned_overflow_fix.sql",
  "utf8",
);

describe("Football Weekly Auction owned-count overflow hotfix", () => {
  it("allows CFB players above the three-team scoring requirement to keep bidding", () => {
    expect(migration).toContain("and p_owned>=0");
    expect(migration).not.toContain("p_owned between 0 and p_required");
    expect(migration).toContain("9,3,4,array[9,0,0]");
    expect(migration).toContain("9,4,9,0,0");
  });

  it("keeps the bankroll and invalid-owned-count guards", () => {
    expect(migration).toContain("normalized.committed<=p_bankroll");
    expect(migration).toContain("9,3,-1,array[1,0,0]");
    expect(migration).toContain("9,3,4,array[10,0,0]");
  });
});
