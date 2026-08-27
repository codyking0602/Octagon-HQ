import { describe, expect, it } from "vitest";
import historicalAnalysisMigration from "../../../supabase/migrations/202612310060_auction_private_ultimate_fighter_analysis.sql?raw";
import handoffMigration from "../../../supabase/migrations/202612310065_auction_octagon_verdict_copy.sql?raw";

describe("retired Auction private matchup analysis", () => {
  it("keeps the old migration immutable but removes its function from current runtime ownership", () => {
    expect(historicalAnalysisMigration).toContain(
      "create or replace function private.auction_ultimate_fighter_analysis(p_auction_id uuid)",
    );
    expect(handoffMigration).toContain(
      "drop function private.auction_ultimate_fighter_analysis(uuid);",
    );
  });

  it("leaves the codes-only participant packet as the current Octagon Verdict handoff", () => {
    expect(handoffMigration).toContain("'packet_version', 'auction-fight-breakdown-v3'");
    expect(handoffMigration).toContain("private.auction_rating_code(");
    expect(handoffMigration).not.toContain("'category_edges',");
    expect(handoffMigration).not.toContain("'strongest_swings',");
    expect(handoffMigration).not.toContain("'closest_swings',");
  });
});
