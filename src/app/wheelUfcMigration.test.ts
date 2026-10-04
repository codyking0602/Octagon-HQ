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

  it("keeps grades private during drafting and reveals frozen fighter grades only after natural completion", () => {
    expect(migration).toContain("hidden_grade numeric");
    expect(migration).toContain("revoke all on private.wheel_ufc_fighters from public, anon, authenticated");
    expect(migration).toContain("when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade");
    expect(migration).toContain("'creator_final_grade'");
    expect(migration).toContain("'recipient_final_grade'");
    expect(repository).toContain("revealed_grade");
    expect(repository).not.toContain("raw_grade");
    expect(page).toContain("HQ grades incoming");
    expect(page).toContain("revealCount");
    expect(page).not.toContain("hidden_grade");
  });

  it("pins the current Meta rankings snapshot and exposes only authenticated RPCs", () => {
    expect(migration).toContain("rankings_as_of date not null default date '2026-10-04'");
    expect(migration).toContain("'rankingsAsOf', '2026-10-04'");
    expect(migration).toContain("'rankingsSource', 'Meta UFC Rankings'");
    expect(migration).toContain("create or replace function public.spin_wheel_ufc");
    expect(migration).toContain("create or replace function public.get_wheel_ufc_candidates");
    expect(migration).toContain("grant execute on function public.pick_wheel_ufc");
    expect(migration).toContain("security invoker");
  });

  it("uses the Meta rank bands and folds UFC 332 outcomes into the current unranked pool", () => {
    expect(migration).toContain("manel-kape|Manel Kape|Flyweight|1|false");
    expect(migration).toContain("alexandre-pantoja|Alexandre Pantoja|Flyweight|2|false");
    expect(migration).toContain("raul-rosas-jr|Raul Rosas Jr.|Bantamweight|8|false");
    expect(migration).toContain("alex-pereira|Alex Pereira|Heavyweight|3|false");
    expect(migration).toContain("payton-talbott|Payton Talbott|Bantamweight||false");
    expect(migration).toContain("esteban-ribovics|Esteban Ribovics|Lightweight||false");
    expect(migration).toContain("roberto-soldic|Roberto Soldić|Welterweight||false");
    expect(migration).toContain("damian-pinas|Damian Pinas|Middleweight||false");
    expect(migration).toContain("johnny-walker|Johnny Walker|Heavyweight||false");
  });

  it("uses the straight eight-fighter average so one elite spin cannot be amplified into the result", () => {
    expect(migration).toContain("round(greatest(0::numeric, least(100::numeric, p_raw_grade)), 1)");
    expect(migration).not.toContain("2.5 * (p_raw_grade - 95)");
  });
});
