import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310256_wheel_ufc_v1.sql",
  "utf8",
);
const repository = readFileSync("src/features/play/wheelUfcRepository.ts", "utf8");
const page = [
  "src/features/back-room/WheelUfcPage.tsx",
  "src/features/back-room/WheelUfcSetup.tsx",
  "src/features/back-room/WheelUfcMatch.tsx",
  "src/features/back-room/WheelUfcComponents.tsx",
].map((path) => readFileSync(path, "utf8")).join("\n");

describe("Wheel of UFC v1 contract", () => {
  it("locks the eight men's divisions and 16-turn head-to-head format", () => {
    for (const division of [
      "Flyweight",
      "Bantamweight",
      "Featherweight",
      "Lightweight",
      "Welterweight",
      "Middleweight",
      "Light Heavyweight",
      "Heavyweight",
    ]) {
      expect(migration).toContain(`'${division}'`);
    }
    expect(migration).toContain("turn_count integer not null default 0 check (turn_count between 0 and 16)");
    expect(migration).toContain("if v_next_turn_count = 16 then");
    expect(migration).toContain("unique (challenge_id, profile_id, weight_class)");
    expect(migration).toContain("unique (challenge_id, fighter_slug)");
  });

  it("uses the approved weighted wheel and filters dead categories before the draw", () => {
    expect(migration).toContain("('champion',1)");
    expect(migration).toContain("('top-5',2)");
    expect(migration).toContain("('rank-6-15',3)");
    expect(migration).toContain("('unranked',4)");
    expect(migration).toContain("('country',4)");
    expect(migration).toContain("('young-gun',3)");
    expect(migration).toContain("('veteran',3)");
    expect(migration).toContain("private.wheel_ufc_category_has_candidate");
    expect(migration).toContain("No legal Wheel of UFC category remains for your open divisions");
    expect(migration).toContain("'champion', 5");
    expect(migration).toContain("'top-5', 10");
    expect(migration).toContain("'rank-6-15', 15");
    expect(migration).toContain("'unranked', 20");
    expect(migration).toContain("'country', 20");
    expect(migration).toContain("'young-gun', 15");
    expect(migration).toContain("'veteran', 15");
  });

  it("seeds the full current ranked snapshot plus one verified unranked option per division", () => {
    const versionRows = migration.match(
      /,'ufc-wheel-ranking-anchor-2026-10-04-v1','2026-10-04'/g,
    ) ?? [];
    expect(versionRows).toHaveLength(136);
    expect(migration).toContain("'joshua-van','Joshua Van','Flyweight',null,true");
    expect(migration).toContain("'petr-yan','Petr Yan','Bantamweight',null,true");
    expect(migration).toContain("'ciryl-gane','Ciryl Gane','Heavyweight',null,true");
    expect(migration).toContain("'rei-tsuruya','Rei Tsuruya','Flyweight',null,false");
    expect(migration).toContain("'ateba-gautier','Ateba Gautier','Middleweight',null,false");
    expect(migration).toContain("'jordan-jackson','Jordan Jackson','Heavyweight',null,false");
  });

  it("keeps Young Gun under 25 and Veteran at 10+ UFC fights as explicit audited flags", () => {
    expect(migration).toContain("Young Gun = under 25; Veteran = 10+ UFC fights");
    expect(migration).toContain("'youngGunRule', 'under-25'");
    expect(migration).toContain("'veteranRule', '10-plus-ufc-fights'");
    expect(migration).toMatch(/'joshua-van','Joshua Van','Flyweight',null,true,'Myanmar',true,false/);
    expect(migration).toMatch(/'ricky-simon','Ricky Simon','Bantamweight',null,false,'United States',false,true/);
  });

  it("server-validates every pick and never publishes individual fighter grades", () => {
    expect(migration).toContain("That fighter has already been drafted in this matchup");
    expect(migration).toContain("That weight-class slot is already filled");
    expect(migration).toContain("That fighter is not eligible for this spin");
    expect(migration).toContain("v_fighter.hidden_grade");
    expect(migration).toContain("'finalGrade', v_creator_final");
    expect(migration).toContain("'finalGrade', v_recipient_final");
    expect(repository).not.toContain("hidden_grade");
    expect(repository).not.toContain("raw_grade");
    expect(page).not.toContain("hidden_grade");
    expect(page).not.toContain("raw_grade");
  });

  it("exposes authenticated RPC wrappers while private state remains inaccessible directly", () => {
    expect(migration).toContain("alter table private.wheel_ufc_matches enable row level security");
    expect(migration).toContain("revoke all on private.wheel_ufc_matches from public, anon, authenticated");
    for (const fn of [
      "get_my_wheel_ufc_match",
      "create_wheel_ufc_challenge",
      "open_wheel_ufc_challenge",
      "spin_wheel_ufc",
      "list_my_wheel_ufc_candidates",
      "pick_wheel_ufc",
      "forfeit_wheel_ufc",
    ]) {
      expect(migration).toContain(`public.${fn}`);
    }
    expect(migration).toContain("security invoker");
  });
});
