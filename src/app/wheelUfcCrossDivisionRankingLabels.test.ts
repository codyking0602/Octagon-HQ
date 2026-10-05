import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310265_wheel_ufc_cross_division_ranking_labels.sql",
  "utf8",
);

describe("Wheel of UFC cross-division ranking labels", () => {
  it("uses another active division ranking for display when the selected slot is unranked", () => {
    expect(migration).toContain("private.wheel_ufc_ranking_label");
    expect(migration).toContain("fighter.division <> p_division");
    expect(migration).toContain("alternate_ranked.division_label || ' #' || alternate_ranked.ranking::text");
  });

  it("fixes both duplicated cross-division fighters in the current pool", () => {
    expect(migration).toContain("private.wheel_ufc_ranking_label('alex-pereira', 'Heavyweight')");
    expect(migration).toContain("Alex Pereira Heavyweight display ranking expected LHW #3");
    expect(migration).toContain("private.wheel_ufc_ranking_label('johnny-walker', 'Heavyweight')");
    expect(migration).toContain("Johnny Walker Heavyweight display ranking expected LHW #13");
  });

  it("keeps the fighter's selected-division ranking unchanged when one exists", () => {
    expect(migration).toContain("private.wheel_ufc_ranking_label('alex-pereira', 'Light Heavyweight')");
    expect(migration).toContain("Alex Pereira Light Heavyweight display ranking expected #3");
  });

  it("repairs candidate responses and already-saved picks without changing eligibility or hidden grades", () => {
    expect(migration).toContain("'ranking_label', private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division)");
    expect(migration).toContain("before insert or update of fighter_id, roster_slot");
    expect(migration).toContain("update private.wheel_ufc_picks pick");
    expect(migration).toContain("Spin eligibility remains division-specific");
    expect(migration).not.toContain("hidden_grade =");
    expect(migration).not.toContain("private.wheel_ufc_category_ok(" + "\n  p_category");
  });
});
