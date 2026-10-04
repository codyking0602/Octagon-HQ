import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310256_wheel_ufc_v1.sql",
  "utf8",
);
const repository = readFileSync("src/features/play/wheelUfcRepository.ts", "utf8");
const page = readFileSync("src/features/back-room/UfcWheelPage.tsx", "utf8");

describe("Wheel of UFC v1 contract", () => {
  it("locks eight men's divisions and sixteen alternating turns", () => {
    for (const slot of [
      "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
      "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
    ]) expect(migration).toContain(`'${slot}'`);
    expect(migration).toContain("turn_count integer not null default 0 check (turn_count between 0 and 16)");
    expect(migration).toContain("if v_next_turn_count = 16 then");
    expect(migration).toContain("v_first_turn := case when random() < 0.5");
  });

  it("locks the approved weighted category rules", () => {
    for (const [category, weight] of [
      ["CHAMPION", 5], ["TOP_5", 10], ["SIX_TO_FIFTEEN", 15], ["UNRANKED", 20],
      ["COUNTRY", 20], ["YOUNG_GUN", 15], ["VETERAN", 15],
    ] as const) {
      expect(migration).toContain(`('${category}', ${weight})`);
    }
    expect(migration).toContain("'youngGunRule', 'under-25'");
    expect(migration).toContain("'veteranRule', '10-plus-ufc-fights'");
    expect(migration).toContain("fighter.young_gun");
    expect(migration).toContain("fighter.veteran_10_plus");
  });

  it("renormalizes late spins to viable remaining categories and viable countries", () => {
    expect(migration).toContain("cardinality(private.wheel_ufc_eligible_slots");
    expect(migration).toContain("cross join lateral generate_series(1, viable.weight)");
    expect(migration).toContain("p_required_country_code");
    expect(migration).toContain("p_fighter_country_code");
    expect(migration).toContain("count(distinct fighter.division)::integer as slot_count");
    expect(migration).toContain("cross join lateral generate_series(1, greatest(1, country_counts.slot_count))");
  });

  it("server-owns candidate eligibility and matchwide fighter uniqueness", () => {
    expect(migration).toContain("unique (challenge_id, fighter_id)");
    expect(migration).toContain("create or replace function private.get_wheel_ufc_candidates");
    expect(migration).toContain("create or replace function private.pick_wheel_ufc");
    expect(migration).toContain("That fighter is not eligible for this spin");
    expect(repository).toContain("p_fighter_id: fighterId");
    expect(repository).not.toContain("hiddenGrade");
  });

  it("keeps all individual grades private while returning final aggregate grades", () => {
    expect(migration).toContain("hidden_grade numeric");
    expect(migration).toContain("revoke all on private.wheel_ufc_fighters from public, anon, authenticated");
    expect(migration).toContain("'creator_final_grade'");
    expect(migration).toContain("'recipient_final_grade'");
    expect(repository).not.toContain("hidden_grade");
    expect(repository).not.toContain("raw_grade");
    expect(page).not.toContain("hidden_grade");
    expect(page).not.toContain("raw_grade");
  });

  it("pins the launch rankings snapshot and exposes only authenticated RPCs", () => {
    expect(migration).toContain("rankings_as_of date not null default date '2026-09-29'");
    expect(migration).toContain("'rankingsAsOf', '2026-09-29'");
    expect(migration).toContain("create or replace function public.spin_wheel_ufc");
    expect(migration).toContain("create or replace function public.get_wheel_ufc_candidates");
    expect(migration).toContain("grant execute on function public.pick_wheel_ufc");
    expect(migration).toContain("security invoker");
  });
});
