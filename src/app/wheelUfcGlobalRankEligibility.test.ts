import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310267_wheel_ufc_global_rank_eligibility.sql",
  "utf8",
);

describe("Wheel of UFC global rank-band eligibility", () => {
  it("uses fighter-wide active ranking status for rank-band categories", () => {
    expect(migration).toContain("create or replace function private.wheel_ufc_fighter_category_ok");
    expect(migration).toContain("bool_or(fighter.is_champion)");
    expect(migration).toContain("min(fighter.ranking)");
    expect(migration).toContain("and fighter.fighter_id = p_fighter_id");
  });

  it("removes ranked cross-division fighters from UNRANKED while keeping truly unranked fighters", () => {
    expect(migration).toContain("Alex Pereira must not qualify for an UNRANKED spin");
    expect(migration).toContain("Johnny Walker must not qualify for an UNRANKED spin");
    expect(migration).toContain("Gable Steveson should remain eligible for UNRANKED");
  });

  it("lets Alex Pereira qualify for TOP 5 from his official LHW ranking", () => {
    expect(migration).toContain("Alex Pereira must qualify for TOP 5 from official LHW #3");
  });

  it("updates current-match slot counts and candidate responses dynamically", () => {
    expect(migration).toContain("create or replace function private.wheel_ufc_eligible_slots");
    expect(migration).toContain("create or replace function private.wheel_ufc_eligible_slot_counts");
    expect(migration).toContain("create or replace function private.get_wheel_ufc_candidates");
    expect(migration).toContain("private.wheel_ufc_ranking_label(candidate.fighter_id, candidate.division)");
    expect(migration).not.toContain("limit 6");
  });

  it("enforces the corrected category server-side on picks", () => {
    expect(migration).toContain("create or replace function private.enforce_wheel_ufc_global_rank_category");
    expect(migration).toContain("before insert on private.wheel_ufc_picks");
    expect(migration).toContain("raise exception 'That fighter is not eligible for this spin'");
  });
});
