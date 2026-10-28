import { describe, expect, it } from "vitest";
import integerScoringMigration from "../../../supabase/migrations/202612310038_auction_integer_scoring.sql?raw";
import v8GraderSupportMigration from "../../../supabase/migrations/202612310064_auction_v8_grader_support.sql?raw";

describe("Auction v8 grader support", () => {
  it("targets the exact v7-only canonical grader gate that rejected production v8 games", () => {
    expect(integerScoringMigration).toContain(
      "v_game.content_version = 'ufc-auction-2026-08-v7'",
    );
    expect(integerScoringMigration).toContain(
      "raise exception 'Auction grading version is unsupported'",
    );
    expect(v8GraderSupportMigration).toContain(
      "pg_get_functiondef('private.grade_auction(uuid)'::regprocedure)",
    );
  });

  it("authorizes v8 beside v7 for grader v3 and the standard three-selection format", () => {
    expect(v8GraderSupportMigration).toContain(
      "v_game.content_version in (''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')",
    );
    expect(v8GraderSupportMigration).toContain(
      "E'''ufc-auction-2026-08-v7'',\\n      ''ufc-auction-2026-08-v8''\\n    ) then 3'",
    );
  });

  it("preserves one canonical grader and does not touch catalog or scoring inputs", () => {
    expect(v8GraderSupportMigration).not.toContain(
      "create or replace function private.grade_auction",
    );
    expect(v8GraderSupportMigration).not.toMatch(/insert\s+into\s+private\.auction_catalog/i);
    expect(v8GraderSupportMigration).not.toMatch(/update\s+private\.auction_catalog/i);
    expect(v8GraderSupportMigration).not.toMatch(/delete\s+from\s+private\.auction_catalog/i);
    expect(v8GraderSupportMigration).not.toContain("grading_inputs");
  });
});
