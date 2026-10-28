import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310267_wheel_ufc_global_unranked_eligibility.sql",
  "utf8",
);

describe("Wheel of UFC global unranked eligibility", () => {
  it("treats UNRANKED as unranked across every active division row", () => {
    expect(migration).toContain("private.wheel_ufc_is_globally_unranked");
    expect(migration).toContain("fighter.fighter_id = p_fighter_id");
    expect(migration).toContain("(fighter.is_champion or fighter.ranking is not null)");
    expect(migration).toContain("p_category <> 'UNRANKED'");
    expect(migration).toContain("v_match.pending_category <> 'UNRANKED'");
  });

  it("fixes Alex Pereira and Johnny Walker without changing a truly unranked heavyweight", () => {
    expect(migration).toContain("wheel_ufc_is_globally_unranked('alex-pereira') is distinct from false");
    expect(migration).toContain("wheel_ufc_is_globally_unranked('johnny-walker') is distinct from false");
    expect(migration).toContain("wheel_ufc_is_globally_unranked('gable-steveson') is distinct from true");
    expect(migration).toContain("Alex Pereira Heavyweight display label must remain LHW #3");
    expect(migration).toContain("Johnny Walker Heavyweight display label must remain LHW #13");
  });

  it("keeps slots, scarcity counts, candidates, and server pick authorization aligned", () => {
    expect(migration).toContain("create or replace function private.wheel_ufc_eligible_slots");
    expect(migration).toContain("create or replace function private.wheel_ufc_eligible_slot_counts");
    expect(migration).toContain("create or replace function private.get_wheel_ufc_candidates");
    expect(migration).toContain("create or replace function private.guard_wheel_ufc_global_unranked");
    expect(migration).toContain("before insert on private.wheel_ufc_picks");
  });

  it("preserves the strategy-polish full candidate list and hidden grades", () => {
    expect(migration).not.toContain("limit 6");
    expect(migration).not.toContain("hidden_grade =");
    expect(migration).toContain(
      "'ranking_label', private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division)",
    );
  });
});
