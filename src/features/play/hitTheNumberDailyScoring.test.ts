import { describe, expect, it } from "vitest";
import dailyScoringMigration from "../../../supabase/migrations/202612310040_hit_the_number_price_is_right_scoring.sql?raw";
import { hitTheNumberScore } from "./hitTheNumberEngine";

describe("Hit the Number authoritative Daily Price Is Right scoring", () => {
  it("patches the one canonical Daily grader in place", () => {
    expect(dailyScoringMigration).toContain(
      "private.grade_daily_challenge(text,text,jsonb,jsonb)",
    );
    expect(dailyScoringMigration).toContain(
      "Canonical Daily Hit the Number grader no longer matches the expected scoring shape.",
    );
    expect(dailyScoringMigration).not.toContain(
      "create or replace function private.grade_daily_challenge(",
    );
  });

  it("locks the server buckets to the same 100 / 99 / 74 boundaries as the game engine", () => {
    expect(hitTheNumberScore({ status: "perfect", target: 1_000, distance: 0, pickCount: 4 })).toBe(100);
    expect(hitTheNumberScore({ status: "under", target: 1_000, distance: 1, pickCount: 4 })).toBe(99);
    expect(hitTheNumberScore({ status: "bust", target: 1_000, distance: 1, pickCount: 4 })).toBe(74);

    expect(dailyScoringMigration).toContain(
      "least(74, round(75 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)",
    );
    expect(dailyScoringMigration).toContain(
      "else greatest(\n        75,\n        least(99, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)",
    );
    expect(dailyScoringMigration).toContain("if v_score <> 100 then");
    expect(dailyScoringMigration).toContain("if v_score <> 99 then");
    expect(dailyScoringMigration).toContain("if v_score <> 74 then");
  });
});
