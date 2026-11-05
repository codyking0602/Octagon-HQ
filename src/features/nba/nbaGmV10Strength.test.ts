import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration=readFileSync("supabase/migrations/202612310937_nba_gm_v10_seven_player_strength.sql","utf8");
const regression=readFileSync("supabase/tests/nba_gm_v10_seven_player_strength.sql","utf8");
const model=readFileSync("src/features/nba/nbaGmDevModel.ts","utf8");
const repository=readFileSync("src/features/nba/nbaGmDevRepository.ts","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const evidence=readFileSync("docs/nba-gm-v10-seven-player-calibration-2026-11-04.md","utf8");

describe("NBA GM V10 seven-man rotation team strength",()=>{
  it("removes only duplicated team-strength penalties, not six-skill/player-identity grading",()=>{
    expect(migration).toContain("private.nba_gm_v9_season(jsonb,integer)");
    expect(migration).toContain("FUNCTION private.nba_gm_v10_season(");
    expect(migration).toContain("v_def:=greatest(-9.0,least(6.25,v_def));");
    expect(migration).toContain("v_off+v_def+v_fit");
    expect(migration).toContain("private.nba_gm_v7_outcome_odds(v_strength)");
    expect(migration).toContain("private.nba_gm_v9_overall(v_net)");
    expect(migration).toContain("private.nba_gm_v10_season_lineup(p_state,p_year)");
    expect(regression).toContain("V10 original seven:");
    expect(regression).toContain("v_v10:=private.nba_gm_v2_season(v_state,1)");
    expect(regression).toContain("v_v9 is distinct from private.nba_gm_v9_season");
  });
  it("opts in new games, retains legacy saved V9, protects contracts, cap, and 90/3/7 score",()=>{
    expect(migration).toContain("'simulationModelVersion',10,'lineupModelVersion',1");
    expect(migration).toContain("private.nba_gm_v9_final_score(jsonb)");
    expect(migration).toContain("private.nba_gm_v10_final_score(p_state)");
    expect(migration).toContain("jsonb_build_array(155000000,155000000,155000000)");
    expect(migration).toContain("v_roster*.90+v_record*.03+v_playoff*.07");
    expect(model).toContain("simulationModelVersion?: 5 | 6 | 7 | 8 | 9 | 10;");
    expect(repository).toContain("z.literal(9),z.literal(10)");
    expect(page).toContain("graded={run.simulationModelVersion===6||run.simulationModelVersion===7||run.simulationModelVersion===8||run.simulationModelVersion===9||run.simulationModelVersion===10}");
    expect(regression).toContain("v_score10 is distinct from v_score9");
    expect(regression).toContain("private.nba_gm_contract_candidates_2026_27");
  });
  it("uses all 30 real-team cores, historical 150, and owner before/after comparisons as evidence",()=>{
    expect(evidence).toContain("30 teams");
    expect(evidence).toContain("2022–2026");
    expect(evidence).toContain("$172.27M");
    expect(evidence).toContain("101");
    expect(evidence).toContain("No contract rules");
    for(const name of ["Oklahoma City","Houston","Denver","San Antonio","Luka","Brunson"])
      expect(evidence).toContain(name);
  });
});