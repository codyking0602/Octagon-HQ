import { describe, expect, it } from "vitest";
import priceIsRightMigration from "../../../supabase/migrations/202612310040_hit_the_number_price_is_right_scoring.sql?raw";
import scoreBandMigration from "../../../supabase/migrations/202612310106_hit_the_number_score_bands.sql?raw";
import { hitTheNumberScore } from "./hitTheNumberEngine";

describe("Hit the Number authoritative Daily Price Is Right scoring", () => {
  it("patches the existing Hit the Number delegate while keeping the canonical Daily entry point", () => {
    expect(priceIsRightMigration).toContain(
      "private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)",
    );
    expect(priceIsRightMigration).toContain(
      "private.grade_daily_challenge(\n    'hit_the_number'",
    );
    expect(priceIsRightMigration).toContain(
      "Canonical Daily grader no longer delegates historical scoring to the expected owner.",
    );
    expect(priceIsRightMigration).not.toContain(
      "create or replace function private.grade_daily_challenge(",
    );
    expect(priceIsRightMigration).not.toContain(
      "create or replace function private.grade_daily_challenge_pre_combo(",
    );
  });

  it("locks the server buckets to the same 100 / 99 / 50 / 49 boundaries as the game engine", () => {
    expect(hitTheNumberScore({ status: "perfect", target: 1_000, distance: 0, pickCount: 4 })).toBe(100);
    expect(hitTheNumberScore({ status: "under", target: 1_000, distance: 1, pickCount: 4 })).toBe(99);
    expect(hitTheNumberScore({ status: "under", target: 1_000, distance: 996, pickCount: 4 })).toBe(50);
    expect(hitTheNumberScore({ status: "bust", target: 1_000, distance: 1, pickCount: 4 })).toBe(49);

    expect(scoreBandMigration).toContain(
      "least(49, round(50 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)",
    );
    expect(scoreBandMigration).toContain(
      "else greatest(\n        50,\n        least(99, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)",
    );
    expect(scoreBandMigration).toContain("if v_score <> 100 then");
    expect(scoreBandMigration).toContain("if v_score <> 99 then");
    expect(scoreBandMigration).toContain("if v_score <> 49 then");
    expect(scoreBandMigration).toContain("if v_score <> 50 then");
  });
});
