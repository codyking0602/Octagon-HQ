import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310265_oct4_troy_sports_feud_grading_repair.sql",
  "utf8",
);

describe("October 4 Troy Sports Feud grading repair", () => {
  it("adds the audited two-point coach alternates to the live setup", () => {
    expect(migration).toContain("'cfb-main-10-4:v10'");
    expect(migration).toContain("'displayName', 'Kalen DeBoer'");
    expect(migration).toContain("'cfb-main-10-4:v11'");
    expect(migration).toContain("'displayName', 'Dan Mullen'");
    expect(migration).toContain("'alsoAcceptedEntityIds'");
  });

  it("adds Jadan Baugh as a one-point Fast Money alternate", () => {
    expect(migration).toContain("'cfb-fast5-03-2:v8'");
    expect(migration).toContain("'displayName', 'Jadan Baugh'");
    expect(migration).toContain("'jadan_baugh_points', 1");
  });

  it("preserves the existing four-correct-answer rule and corrects Troy to 67", () => {
    expect(migration).toContain("profile.normalized_name = 'TROY'");
    expect(migration).toContain("if v_score not in (79, 67)");
    expect(migration).toContain("set native_score = 67");
    expect(migration).toContain("'main_points', 39");
    expect(migration).toContain("'fast_money_points', 28");
    expect(migration).toContain("'first_board_settled_after_four_correct', true");
    expect(migration).toContain("'kalen_deboer_points', 2");
    expect(migration).toContain("'dan_mullen_points', 2");
  });

  it("locks Troy's audited submission evidence and setup immutability handling", () => {
    expect(migration).toContain("lower(v_actions->1->>'answer') <> 'kalen daebor'");
    expect(migration).toContain("lower(v_actions->3->>'answer') <> 'dan mullen'");
    expect(migration).toContain("lower(v_actions->12->>'answer') <> 'jadan baugh'");
    expect(migration).toContain(
      "alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable",
    );
    expect(migration).toContain(
      "alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable",
    );
  });
});
