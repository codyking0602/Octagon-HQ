import { describe, expect, it } from "vitest";
import priceIsRightMigration from "../../../supabase/migrations/202612310040_hit_the_number_price_is_right_scoring.sql?raw";
import targetPercentageMigration from "../../../supabase/migrations/202612310135_hit_the_number_target_percentage_scoring.sql?raw";
import { hitTheNumberScore } from "./hitTheNumberEngine";

describe("Hit the Number authoritative Daily Bob Barker scoring", () => {
  it("keeps the canonical Daily entry point delegated to the existing grading owner", () => {
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
  });

  it("locks Daily and casual to the same target-percentage score curve", () => {
    expect(hitTheNumberScore({ status: "perfect", target: 45, distance: 0, pickCount: 6 })).toBe(100);
    expect(hitTheNumberScore({ status: "under", target: 45, distance: 10, pickCount: 6 })).toBe(89);
    expect(hitTheNumberScore({ status: "bust", target: 45, distance: 8, pickCount: 6 })).toBe(41);
    expect(hitTheNumberScore({ status: "under", target: 45, distance: 44, pickCount: 6 })).toBe(51);
    expect(hitTheNumberScore({ status: "bust", target: 45, distance: 1, pickCount: 6 })).toBe(49);

    expect(targetPercentageMigration).toContain(
      "least(49, round(50 - (50 * v_hit_distance / v_hit_target))::integer)",
    );
    expect(targetPercentageMigration).toContain(
      "least(99, round(100 - (50 * v_hit_distance / v_hit_target))::integer)",
    );
    expect(targetPercentageMigration).toContain("v_expected text := $old$");
    expect(targetPercentageMigration).toContain("v_replacement text := $new$");
  });

  it("regrades the affected September 15 UFC Daily attempts in the same migration", () => {
    expect(targetPercentageMigration).toContain("challenge.central_day = date '2026-09-15'");
    expect(targetPercentageMigration).toContain("schedule.sport = 'ufc'");
    expect(targetPercentageMigration).toContain("challenge.game_type = 'hit_the_number'");
    expect(targetPercentageMigration).toContain("normalized_score = regraded.normalized_score");
    expect(targetPercentageMigration).toContain("Target 45 / total 35 must score 89");
    expect(targetPercentageMigration).toContain("Target 45 / total 53 bust must score 41");
  });
});
